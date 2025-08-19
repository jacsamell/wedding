terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  domain_name = var.domain_name != "" ? var.domain_name : "${var.project_name}.s3-website-${var.aws_region}.amazonaws.com"
}

# Route53 Hosted Zone
resource "aws_route53_zone" "main" {
  name = var.domain_name
  
  tags = {
    Name        = "${var.project_name}-hosted-zone"
    Environment = var.environment
  }
}

# ACM Certificate for CloudFront (must be in us-east-1)
resource "aws_acm_certificate" "website" {
  provider = aws.us_east_1
  
  domain_name       = var.domain_name
  validation_method = "DNS"
  
  subject_alternative_names = [
    "www.${var.domain_name}"
  ]
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name        = "${var.project_name}-certificate"
    Environment = var.environment
  }
}

# DNS validation records for ACM
resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1
  
  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

# Route53 A record for root domain
resource "aws_route53_record" "website_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for root domain (IPv6)
resource "aws_route53_record" "website_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"
  
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 A record for www subdomain
resource "aws_route53_record" "website_www_a" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for www subdomain (IPv6)
resource "aws_route53_record" "website_www_aaaa" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "AAAA"
  
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# S3 Bucket for static website hosting
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-website-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# CloudFront Distribution
resource "aws_cloudfront_origin_access_identity" "website" {
  comment = "OAI for ${var.project_name} website"
}

resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  
  aliases = [
    var.domain_name,
    "www.${var.domain_name}"
  ]

  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.website.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.website.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.website.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name        = "${var.project_name}-cf-distribution"
    Environment = var.environment
  }
}

# DynamoDB Table for RSVPs
resource "aws_dynamodb_table" "rsvps" {
  name           = "${var.project_name}-rsvps-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.project_name}-rsvps"
    Environment = var.environment
  }
}

# IAM Role for RSVP Lambda
resource "aws_iam_role" "rsvp_lambda_role" {
  name = "${var.project_name}-rsvp-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "rsvp_lambda_policy" {
  name = "${var.project_name}-rsvp-lambda-policy-${var.environment}"
  role = aws_iam_role.rsvp_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.rsvps.arn,
          "${aws_dynamodb_table.rsvps.arn}/index/*"
        ]
      }
    ]
  })
}

# IAM Role for Spotify Lambda
resource "aws_iam_role" "spotify_lambda_role" {
  name = "${var.project_name}-spotify-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "spotify_lambda_policy" {
  name = "${var.project_name}-spotify-lambda-policy-${var.environment}"
  role = aws_iam_role.spotify_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# RSVP Lambda Function
resource "aws_lambda_function" "rsvp_api" {
  filename         = "rsvp-lambda.zip"
  function_name    = "${var.project_name}-rsvp-api-${var.environment}"
  role            = aws_iam_role.rsvp_lambda_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("rsvp-lambda.zip")
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.rsvps.name
      CORS_ORIGIN    = "https://${var.domain_name}"
    }
  }

  tags = {
    Name        = "${var.project_name}-rsvp-api"
    Environment = var.environment
  }
}

# Spotify Lambda Function
resource "aws_lambda_function" "spotify_api" {
  filename         = "spotify-lambda.zip"
  function_name    = "${var.project_name}-spotify-api-${var.environment}"
  role            = aws_iam_role.spotify_lambda_role.arn
  handler         = "spotify-handler.handler"
  source_code_hash = filebase64sha256("spotify-lambda.zip")
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      SPOTIFY_CLIENT_ID     = var.spotify_client_id
      SPOTIFY_CLIENT_SECRET = var.spotify_client_secret
      SPOTIFY_REDIRECT_URI  = var.spotify_redirect_uri
      SPOTIFY_REFRESH_TOKEN = var.spotify_refresh_token
      SPOTIFY_PLAYLIST_ID   = var.spotify_playlist_id
      CORS_ORIGIN          = "https://${var.domain_name}"
    }
  }

  tags = {
    Name        = "${var.project_name}-spotify-api"
    Environment = var.environment
  }
}

# Lambda Function URLs
resource "aws_lambda_function_url" "rsvp_api" {
  function_name      = aws_lambda_function.rsvp_api.function_name
  authorization_type = "NONE"
  
  cors {
    allow_credentials = false
    allow_origins     = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["date", "keep-alive", "content-type", "content-length", "authorization"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }
}

resource "aws_lambda_function_url" "spotify_api" {
  function_name      = aws_lambda_function.spotify_api.function_name
  authorization_type = "NONE"
  
  cors {
    allow_credentials = false
    allow_origins     = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["date", "keep-alive", "content-type", "content-length", "authorization"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }
}

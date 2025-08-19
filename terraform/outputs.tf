output "website_url" {
  description = "Website URL with custom domain"
  value       = "https://${var.domain_name}"
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "rsvp_api_url" {
  description = "RSVP Lambda Function URL"
  value       = aws_lambda_function_url.rsvp_api.function_url
}

output "spotify_api_url" {
  description = "Spotify Lambda Function URL"
  value       = aws_lambda_function_url.spotify_api.function_url
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for RSVPs"
  value       = aws_dynamodb_table.rsvps.name
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53 name servers for domain delegation"
  value       = aws_route53_zone.main.name_servers
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.website.arn
}

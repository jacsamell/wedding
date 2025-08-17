variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "jacob-sarah-wedding"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "domain_name" {
  description = "Custom domain name"
  type        = string
  default     = "jacobandsarah.wedding"
}

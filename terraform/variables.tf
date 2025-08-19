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

variable "spotify_client_id" {
  description = "Spotify application client ID"
  type        = string
  sensitive   = true
}

variable "spotify_client_secret" {
  description = "Spotify application client secret"
  type        = string
  sensitive   = true
}

variable "spotify_redirect_uri" {
  description = "Spotify application redirect URI"
  type        = string
  default     = "http://localhost:8080/callback"
}

variable "spotify_refresh_token" {
  description = "Spotify refresh token for the authorized user"
  type        = string
  sensitive   = true
}

variable "spotify_playlist_id" {
  description = "Spotify playlist ID where songs will be added"
  type        = string
  default     = ""
}

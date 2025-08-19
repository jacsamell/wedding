# Lambda Deployment Guide

## Overview

The wedding website now uses **Lambda Function URLs** instead of API Gateway, with separate Lambda functions for:
- **RSVP functionality** (`lambda-rsvp/`)
- **Spotify integration** (`lambda-spotify/`)

## Setup Instructions

### 1. Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new app or use an existing one
3. Note down your:
   - Client ID
   - Client Secret
   - Set redirect URI to `http://localhost:8080/callback`

### 2. Get Spotify Refresh Token

You'll need to go through Spotify's OAuth flow once to get a refresh token. You can use the examples in the `spotify-web-api-node` package or tools like Postman.

### 3. Configure Terraform Variables

1. Copy the example file:
   ```bash
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   ```

2. Fill in your actual values in `terraform.tfvars`:
   ```hcl
   spotify_client_id     = "your_actual_client_id"
   spotify_client_secret = "your_actual_client_secret"
   spotify_refresh_token = "your_actual_refresh_token"
   ```

### 4. Build and Deploy

1. Build the Lambda packages:
   ```bash
   ./build-lambda.sh
   ```

2. Deploy with Terraform:
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

## What's Changed

### From API Gateway to Lambda Function URLs

- **Before**: Used API Gateway v2 (HTTP API) with Lambda integration
- **After**: Direct Lambda Function URLs with built-in CORS support
- **Benefits**: Simpler setup, lower cost, reduced latency

### Separate Lambda Functions

- **RSVP Lambda** (`lambda-rsvp/`):
  - Handles `/rsvp` POST requests
  - Stores guest information in DynamoDB
  - Handles basic song requests (logging only)

- **Spotify Lambda** (`lambda-spotify/`):
  - Handles Spotify API integration
  - Search tracks
  - Add tracks to playlists
  - Full Spotify Web API functionality

### Environment Variables

Each Lambda has its own environment variables:

**RSVP Lambda**:
- `DYNAMODB_TABLE`: DynamoDB table name
- `CORS_ORIGIN`: Allowed origins for CORS

**Spotify Lambda**:
- `SPOTIFY_CLIENT_ID`: Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify app client secret
- `SPOTIFY_REDIRECT_URI`: OAuth redirect URI
- `SPOTIFY_REFRESH_TOKEN`: Long-lived refresh token
- `CORS_ORIGIN`: Allowed origins for CORS

## Outputs

After deployment, Terraform will provide:
- `rsvp_api_url`: Direct URL for RSVP submissions
- `spotify_api_url`: Direct URL for Spotify API calls

## Testing

You can test the endpoints directly:

```bash
# Test RSVP endpoint
curl -X POST https://your-rsvp-function-url/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guests": [{"name": "Test User", "attending": true, "dietary": ""}]}'

# Test Spotify search
curl -X POST https://your-spotify-function-url/ \
  -H "Content-Type: application/json" \
  -d '{"action": "search", "query": "test song"}'
```

## File Structure

```
├── lambda-rsvp/
│   ├── index.js           # RSVP handler
│   └── package.json       # RSVP dependencies
├── lambda-spotify/
│   ├── spotify-handler.js # Spotify handler
│   └── package.json       # Spotify dependencies
├── terraform/
│   ├── main.tf           # Main Terraform config
│   ├── variables.tf      # Variable definitions
│   ├── outputs.tf        # Output definitions
│   └── terraform.tfvars.example # Configuration template
└── build-lambda.sh      # Build script
```

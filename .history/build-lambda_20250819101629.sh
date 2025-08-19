#!/bin/bash

echo "Building Lambda deployment packages..."

# Build RSVP Lambda
echo "Building RSVP Lambda..."
cd lambda-rsvp
npm install --production
zip -r ../terraform/rsvp-lambda.zip .
cd ..

# Build Spotify Lambda
echo "Building Spotify Lambda..."
cd lambda-spotify
npm install --production
zip -r ../terraform/spotify-lambda.zip .
cd ..

echo "Lambda packages created:"
echo "  - terraform/rsvp-lambda.zip"
echo "  - terraform/spotify-lambda.zip"
echo "Ready for Terraform deployment!"

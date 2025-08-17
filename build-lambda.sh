#!/bin/bash

echo "Building Lambda deployment package..."

cd lambda
npm install --production
zip -r ../terraform/lambda.zip .
cd ..

echo "Lambda package created at terraform/lambda.zip"
echo "Ready for Terraform deployment!"

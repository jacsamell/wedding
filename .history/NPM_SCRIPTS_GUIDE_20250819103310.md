# Build & Deploy Guide

You can use either npm scripts or Task commands - they do the same thing!

## Commands

```bash
# Using npm
npm start       # Start development server
npm run build   # Build website and Lambda functions  
npm run deploy  # Deploy to AWS (builds first)

# Using Task (shorter commands)
task start      # Start development server  
task build      # Build website and Lambda functions
task deploy     # Deploy to AWS (builds first)
```

## What Each Does

### `npm start`
- Starts Vite development server on localhost:3000

### `npm run build` 
- Compiles TypeScript and builds the frontend website 
- Builds Lambda deployment packages for RSVP and Spotify APIs

### `npm run deploy`
- Runs `npm run build` first automatically
- Initializes/updates Terraform
- Shows deployment plan
- Applies infrastructure changes
- Deploys both website and Lambda functions

## Prerequisites

Create `terraform/terraform.tfvars` from the example file and fill in your values:
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

Make sure you have AWS CLI configured with proper permissions.

## Typical Workflow

```bash
# Start developing
npm start

# When ready to deploy
npm run deploy
```

That's it! Simple and clean.

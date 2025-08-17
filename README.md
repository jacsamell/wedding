# Wedding Website

A beautiful, responsive wedding website with golden elm tree parallax effects, elegant animations, and a sophisticated design matching your invitation style.

## Features

- **Golden Elm Parallax**: Multi-layered scrolling with floating gold leaves
- **Didone Typography**: Bodoni Moda font matching your invitation
- **Smooth Animations**: Fade-in effects and rotating ornaments
- **Responsive Design**: Beautiful on all devices
- **Garden Theme**: Golden elm tree aesthetic throughout
- **RSVP System**: Ready for backend integration

## Quick Start

1. The site is currently running at http://localhost:8000
2. To restart the server:
   ```bash
   cd /Users/jacob/dev/wedding
   python3 -m http.server 8000
   ```

## Visual Features

### Parallax Effects
- **Hero Section**: Multi-speed layers with floating leaves
- **Tree Trunks**: Subtle golden elm silhouettes on sides
- **Floating Leaves**: Animated gold leaves drifting across sections
- **Background Patterns**: Custom SVG elm leaf patterns

### Typography
- **Headers**: Bodoni Moda (Didone-style) for elegant contrast
- **Body Text**: Lora serif for readability
- **Accents**: DM Serif Display for section titles

## Project Structure

```
wedding/
├── index.html          # Main homepage
├── styles.css          # All styling, animations, and parallax
├── script.js           # Enhanced parallax and interactions
├── package.json        # Project metadata
├── lambda/             # RSVP API function
│   ├── index.js        # Lambda handler
│   └── package.json    # Lambda dependencies
└── terraform/          # AWS infrastructure
    ├── main.tf         # Main infrastructure
    ├── variables.tf    # Configuration variables
    └── outputs.tf      # Output values
```

## Deployment

### 1. Prepare Lambda Function
```bash
cd lambda
npm install
npm run zip
```

### 2. Deploy Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. Upload Website Files
After Terraform creates the infrastructure, upload your files to S3:
```bash
aws s3 sync ../ s3://jacob-sarah-wedding-website-production/ \
  --exclude "terraform/*" \
  --exclude "lambda/*" \
  --exclude ".git/*" \
  --exclude "*.md"
```

## Customization

### Update Content
- All text content is in `index.html`
- Event details, menu items, and info sections are clearly marked

### Modify Colors
The golden color scheme in `styles.css`:
```css
:root {
    --primary-gold: #c9a961;
    --dark-gold: #b8935f;
    --light-gold: #e4d5b7;
    --cream: #fbf8f0;
}
```

### Add Photos
When you have engagement photos:
1. Create an `images/` directory
2. Update the gallery section in `index.html`
3. Replace SVG backgrounds with actual photos

## RSVP Integration

The Lambda function is ready for:
- Creating RSVPs with guest details
- Dietary requirements
- Children count
- Accommodation needs

Connect the frontend form to the API Gateway URL provided by Terraform.

## Next Steps

1. Add engagement photos to gallery
2. Connect RSVP form to Lambda API
3. Update meta tags for SEO/sharing
4. Add favicon
5. Consider adding:
   - Gift registry section
   - Map/directions
   - Hotel recommendations

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS with custom parallax
- **Fonts**: Google Fonts (Bodoni Moda, DM Serif, Lora, Montserrat)
- **Backend**: AWS Lambda + DynamoDB
- **Hosting**: AWS S3 + CloudFront
- **Infrastructure**: Terraform

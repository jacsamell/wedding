# Jacob & Sarah's Wedding Website 💛

A modern, beautiful wedding website built with TypeScript, Vite, and modern CSS. Features smooth animations, responsive design, and optimal performance.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── styles/           # Modular CSS architecture
│   ├── main.css     # Main stylesheet entry point
│   ├── variables.css # CSS custom properties
│   ├── base.css     # Reset and base styles
│   ├── animations.css # Animation definitions
│   ├── components.css # UI component styles
│   ├── sections.css  # Page section styles
│   └── utilities.css # Utility classes
├── types.ts         # TypeScript type definitions
├── utils.ts         # Utility functions
├── countdown.ts     # Countdown timer logic
├── navigation.ts    # Navigation functionality
├── parallax.ts      # Parallax effects
├── animations.ts    # Animation controllers
├── interactions.ts  # User interactions
└── main.ts          # Application entry point
```

## ✨ Features

- **Modern TypeScript Architecture**: Fully typed, modular codebase
- **Smart Navigation**: Countdown timer integrated into navigation bar
- **Responsive Design**: Mobile-first approach with smooth animations
- **Performance Optimized**: Lazy loading, code splitting, optimized assets
- **Smooth Animations**: Intersection Observer-based animations
- **Parallax Effects**: Performant parallax scrolling
- **Interactive Elements**: Magnetic buttons, hover effects
- **Service Worker**: PWA capabilities for offline experience
- **SEO Optimized**: Meta tags, Open Graph, structured data

## 🛠️ Development

### Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally  
- `npm run type-check` - TypeScript type checking
- `npm run lint` - Lint TypeScript files
- `npm run clean` - Clean build artifacts

### Tech Stack

- **Build Tool**: Vite 5
- **Language**: TypeScript 5
- **Styling**: Modern CSS with PostCSS
- **Deployment**: AWS (via Terraform)

### CSS Architecture

The project uses a modular CSS architecture:

- **Variables**: CSS custom properties for consistency
- **Base**: Reset and foundational styles
- **Components**: Reusable UI components (buttons, cards, navigation)
- **Sections**: Page-specific layouts
- **Animations**: Keyframes and animation utilities
- **Utilities**: Single-purpose helper classes

### Performance Optimizations

- Throttled scroll events with RAF
- Intersection Observer for animations
- Image preloading for critical assets
- Tree-shaking for minimal bundle size
- CSS bundling and minification
- Service Worker for caching

## 🎨 Design Principles

- **KISS (Keep It Simple, Stupid)**: Clean, maintainable code
- **Performance First**: Optimized for speed and smooth interactions  
- **Accessibility**: Semantic HTML, focus management, screen reader support
- **Progressive Enhancement**: Works without JavaScript

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🚀 Deployment

```bash
# Build and deploy to AWS
npm run deploy
```

The site is deployed using Terraform to AWS S3 with CloudFront distribution.

---

Built with 💛 by Jacob & Sarah
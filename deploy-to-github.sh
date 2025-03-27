#!/bin/bash
# CropCart GitHub Pages Deployment Script
# This script builds and prepares the application for GitHub Pages hosting

# Set up error handling
set -e
echo "🚀 Starting GitHub Pages deployment process..."

# Ensure we're in the project root directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the project root directory"
  exit 1
fi

# Create a temporary directory for the build
DEPLOY_DIR="github-demo"
echo "📁 Creating deployment directory: $DEPLOY_DIR"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Build the client application
echo "🔨 Building client application..."
echo "Running: npx vite build"
VITE_STATIC_MODE=true npx vite build

# Copy the dist files to the deploy directory
echo "📦 Copying build files to deployment directory..."
cp -r dist/* $DEPLOY_DIR/

# Create a special flag file to indicate this is a GitHub Pages deployment
echo "📝 Creating GitHub Pages flag file..."
echo "window.GITHUB_PAGES_DEPLOYMENT = true;" > $DEPLOY_DIR/github-pages-config.js

# Create a simple index.html file that redirects to the client app
cat > $DEPLOY_DIR/index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CropCart - Farm to Table Marketplace</title>
  <meta name="description" content="CropCart connects local farmers directly with customers for fresh produce and dairy products.">
  <script src="./github-pages-config.js"></script>
  <script>
    // Redirect to the actual app entry point
    window.location.href = './index.html';
  </script>
</head>
<body>
  <noscript>
    <h1>CropCart - Farm to Table Marketplace</h1>
    <p>JavaScript is required to run this application.</p>
    <p>Please enable JavaScript or use a browser that supports it.</p>
  </noscript>
</body>
</html>
EOL

# Create a sample .nojekyll file to prevent GitHub Pages from using Jekyll
touch $DEPLOY_DIR/.nojekyll

# Create a simple README for the GitHub repository
cat > $DEPLOY_DIR/README.md << EOL
# CropCart - Farm to Table Marketplace

This is a static demo of the CropCart application, a platform that connects local farmers directly with customers for fresh produce and dairy products.

## Features

- Browse farm-fresh products by category
- View detailed product information
- Sample farmer dashboard (static data)
- Responsive design for all devices

## Note

This is a frontend-only demo version. Some features that require a backend server (like payments, user authentication, etc.) are simulated with static data.

To run the full application with all features, please clone the main repository and follow the setup instructions.

## Technologies

- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components
EOL

# Create a demo .env file with safe placeholder values
cat > $DEPLOY_DIR/.env << EOL
# Demo Environment Variables
VITE_API_URL=http://localhost:5000
VITE_STATIC_MODE=true
EOL

echo "✅ Deployment preparation complete!"
echo "📂 Your GitHub Pages deployment files are ready in the '$DEPLOY_DIR' directory"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Create a new GitHub repository"
echo "2. Push the contents of the '$DEPLOY_DIR' directory to the repository"
echo "3. Enable GitHub Pages in the repository settings (Settings > Pages)"
echo "4. Select the main branch as the source"
echo ""
echo "Your application will be available at: https://[your-username].github.io/[repo-name]/"
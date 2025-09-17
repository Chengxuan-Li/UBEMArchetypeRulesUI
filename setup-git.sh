#!/bin/bash

# Add all files to git
git add .

# Make initial commit
git commit -F commit-message.txt

# Create and switch to deploy branch
git checkout -b deploy

# Push both branches to origin
git push -u origin main
git push -u origin deploy

echo "✅ Git setup complete!"
echo "📁 Main branch: Contains source code"
echo "🚀 Deploy branch: Triggers GitHub Pages deployment"
echo ""
echo "Next steps:"
echo "1. Go to GitHub repository settings"
echo "2. Navigate to Pages section"
echo "3. Set source to 'GitHub Actions'"
echo "4. The deploy branch will automatically deploy to GitHub Pages"

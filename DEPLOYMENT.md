# Deployment Guide

This guide explains how to deploy the Art Language Interpreter to GitHub Pages.

## Automatic Deployment (Recommended)

The project is configured for automatic deployment using GitHub Actions:

1. **Push to master branch** - Any push to the `master` branch will automatically trigger a build and deployment
2. **Pull request builds** - PRs will build but not deploy, allowing you to test changes
3. **Automatic testing** - The deployment runs tests before building to ensure quality
4. **Note**: Make sure your repository's default branch is `master` (not `main`)

### Setup Steps

1. Go to your GitHub repository settings
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions**
4. That's it! The next push to `master` will deploy automatically

## Manual Deployment

For one-time deployments or testing:

```bash
npm run deploy
```

This command will:
1. Build the production bundle
2. Deploy the `dist` folder to the `gh-pages` branch
3. GitHub Pages will automatically serve from that branch

## Configuration

The deployment is configured in several files:

### `vite.config.ts`
```typescript
base: process.env.NODE_ENV === "production" ? "/art-lang/" : "/"
```
Sets the correct base path for GitHub Pages URLs.

### `.github/workflows/deploy.yml`
Contains the GitHub Actions workflow that handles automatic deployment.

### `public/.nojekyll`
Disables Jekyll processing (required for Vite apps on GitHub Pages).

## Accessing Your Deployed App

Once deployed, your app will be available at:
```
https://[your-username].github.io/art-lang/
```

## Troubleshooting

### Build Failures
- Check the Actions tab in your GitHub repository for error details
- Ensure all tests pass locally: `npm test`
- Verify the build works locally: `npm run build`

### Asset Loading Issues
- Ensure the base path is correctly set in `vite.config.ts`
- Check that `.nojekyll` file exists in the `public` directory

### Deployment Permissions
- The GitHub Actions workflow uses `GITHUB_TOKEN` which is automatically available
- No additional setup or secrets are required

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` directory with your domain
2. Update the workflow file to uncomment the `cname` line
3. Configure your DNS provider to point to GitHub Pages

Example `public/CNAME`:
```
art-lang.example.com
```

## Development vs Production

- **Development** (`npm run dev`): Base path is `/` for local development
- **Production** (`npm run build`): Base path is `/art-lang/` for GitHub Pages
- This ensures the app works correctly in both environments
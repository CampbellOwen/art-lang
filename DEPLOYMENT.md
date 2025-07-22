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
yarn deploy
```

This command will:
1. Build the production bundle using Yarn
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
- Ensure all tests pass locally: `yarn test`
- Verify the build works locally: `yarn build`

### Asset Loading Issues
- Ensure the base path is correctly set in `vite.config.ts`
- Check that `.nojekyll` file exists in the `public` directory

### Git Exit Code 128 Error
If you see "The process '/usr/bin/git' failed with exit code 128":

1. **Check Repository Settings**:
   - Go to Settings → Pages
   - Under "Source", select **"GitHub Actions"** (not "Deploy from branch")
   
2. **Verify Workflow Permissions**:
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**

3. **Enable Actions**:
   - Go to Settings → Actions → General
   - Under "Actions permissions", select **"Allow all actions and reusable workflows"**

4. **Alternative Deployment**:
   If the main workflow fails, you can try the alternative approach:
   - Rename `.github/workflows/deploy-alternative.yml.disabled` to `.github/workflows/deploy-alternative.yml`
   - Disable the main workflow by renaming `deploy.yml` to `deploy.yml.disabled`

### Deployment Permissions
- The GitHub Actions workflow uses `GITHUB_TOKEN` which is automatically available
- Newer workflows use official GitHub Pages actions for better reliability
- If using the alternative workflow, ensure repository permissions are set correctly

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

- **Development** (`yarn dev`): Base path is `/` for local development
- **Production** (`yarn build`): Base path is `/art-lang/` for GitHub Pages
- This ensures the app works correctly in both environments
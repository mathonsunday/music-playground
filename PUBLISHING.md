# Publishing to npm

## Status

✅ Package is ready to publish:
- `"private": true` removed from package.json
- Package metadata added (description, keywords, license, repository)
- `.npmignore` created to exclude dev files
- Build files are ready (`dist/` directory)
- Package name `music-playground` is available on npm

## Steps to Publish

### 1. Login to npm (if not already logged in)

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

### 2. Verify you're logged in

```bash
npm whoami
```

Should output your npm username.

### 3. Publish the package

```bash
npm publish
```

This will publish `music-playground@2.2.0` to npm.

### 4. Verify CDN Access

After publishing, these URLs should work:

**unpkg:**
```html
<script src="https://unpkg.com/music-playground@2.2.0/dist/music-playground.umd.js"></script>
```

**jsdelivr:**
```html
<script src="https://cdn.jsdelivr.net/npm/music-playground@2.2.0/dist/music-playground.umd.js"></script>
```

**Test in browser:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>CDN Test</title>
</head>
<body>
  <script src="https://unpkg.com/music-playground@2.2.0/dist/music-playground.umd.js"></script>
  <script>
    console.log('MusicPlayground:', window.MusicPlayground);
    console.log('Themes:', Object.keys(window.MusicPlayground.themes));
  </script>
</body>
</html>
```

## Package Contents

The published package includes:
- `dist/` - Built files (ESM, UMD, IIFE)
- `src/` - Source TypeScript files
- `README.md` - Documentation
- `package.json` - Package metadata

Excluded (via `.npmignore`):
- `node_modules/`
- Development files (`.vscode/`, `.idea/`)
- Test files (`test-umd.html`)
- Build config (`vite.config.ts`, `tsconfig.json`)

## Future Versions

To publish updates:

1. Update version in `package.json`:
   ```json
   "version": "2.3.0"
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Commit and tag:
   ```bash
   git add .
   git commit -m "v2.3.0: New features"
   git tag v2.3.0
   git push && git push --tags
   ```

4. Publish:
   ```bash
   npm publish
   ```

## Scoped Package Alternative

If you prefer a scoped package (e.g., `@yourusername/music-playground`):

1. Update `package.json`:
   ```json
   "name": "@yourusername/music-playground"
   ```

2. Publish with scope:
   ```bash
   npm publish --access public
   ```

Scoped packages require `--access public` for free public packages.

## Troubleshooting

**Error: "You do not have permission to publish"**
- Make sure you're logged in: `npm whoami`
- Check if the package name is taken: `npm view music-playground`
- Consider using a scoped package name

**Error: "Package name already exists"**
- The name `music-playground` might have been taken
- Use a scoped package: `@yourusername/music-playground`
- Or choose a different name

**CDN not working after publish**
- Wait a few minutes for CDN propagation
- Check package exists: `npm view music-playground`
- Verify `unpkg`/`jsdelivr` fields in package.json

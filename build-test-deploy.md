# Build, Test, Deploy

## Build
```bash
pnpm build
```

## Test
```bash
pnpm test
pnpm test:e2e
```

## Package
- Web: Vercel/Netlify static export
- Desktop: Tauri bundle for Windows/Mac/Linux
- Mobile: Capacitor build for iOS/Android

## Deploy
- Web: `git push origin main` -> CI/CD -> preview + production
- Desktop: GitHub Releases with signed binaries
- Mobile: App Store / Play Store beta track

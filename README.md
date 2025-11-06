# TripTrax (Vue + Vite)

This repository was scaffolded from a single `proto.html` file and migrated into a small Vite + Vue 3 app. The original `proto.html` remains in the repo as a reference.


Quick start (WSL) — using yarn:

```bash
cd /mnt/c/Users/Ltrad/Documents/GIT/Personal/TripTrax
yarn install
yarn dev
```

Open the dev server URL printed by Vite (usually http://localhost:5173).

Notes & limitations:

- The migration kept the original DOM-manipulating logic and exposes some functions on `window` so existing inline `onclick` handlers still work. This is a pragmatic first step; I recommend later refactoring the logic into proper Vue components and reactive state.
- External libs (Leaflet, Leaflet Routing Machine, Tailwind CDN, Phosphor icons) are loaded from CDNs in `index.html` to keep the migration quick. You can replace them with npm packages later.

# Copilot Instructions (OpenHTF)

## Node.js / npm for Web GUI
This repo’s web GUI depends on an older toolchain (webpack 3 + node-sass 7). Use **Node 16.x** to avoid build failures.

### Install Node 16 (Ubuntu/Debian)
```bash
# Remove newer Node.js/npm if installed.
sudo apt-get remove -y nodejs npm
sudo apt-get autoremove -y

# Install Node 16 from NodeSource.
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify versions.
node -v   # expect v16.x
npm -v    # expect v8.x
```

### Install Web GUI dependencies
```bash
cd openhtf/output/web_gui/src
npm install --legacy-peer-deps
```

### Build Web GUI
```bash
cd openhtf/output/web_gui/src
npm run build
```

Notes:
- The build outputs prebuilt assets in `openhtf/output/web_gui/dist`.
- `npm run update_prebuilt` is referenced in CONTRIBUTING.md but not defined in `openhtf/output/web_gui/package.json`.

## Python Tests & Builds
```bash
# From repo root
cd /path/to/openhtf

# Lint/tests (tox)
tox

# Build sdist/wheel
python -m build
```

## Expected Warnings
- Web GUI build shows existing TypeScript/tslint warnings unrelated to changes.
- npm install will report many deprecated packages due to legacy Angular/webpack tooling.

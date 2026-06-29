# MultiTask360 HQ

Your AI-powered business command center.

## Files
```
mt360-hq/
├── public/
│   └── index.html       ← The full app (frontend)
├── server/
│   └── index.js         ← Backend (handles Claude API)
├── package.json
├── render.yaml
└── .gitignore
```

## Deploy to Render via GitHub

### Step 1 — Push to GitHub
1. Go to github.com → New repository → name it `mt360-hq` → Create
2. Upload all these files (drag and drop or use GitHub Desktop)

### Step 2 — Connect to Render
1. Go to render.com → New → Web Service
2. Connect your GitHub repo `mt360-hq`
3. Render auto-detects the settings from render.yaml

### Step 3 — Add your API Key
1. In Render dashboard → your service → Environment
2. Add variable: `ANTHROPIC_API_KEY` = your Anthropic API key
3. Save — Render redeploys automatically

### Done!
Your app will be live at `https://mt360-hq.onrender.com` (or similar URL Render assigns).

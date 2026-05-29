# Render Deployment

This app is configured as a Render Node web service.

## Render settings

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Node version: `22`

The checked-in `render.yaml` contains these settings for Blueprint deploys.

## Required environment variables

Set these in Render before deploying:

- `VITE_RENDER_KNOWLEDGE_AGENT_URL`
- `VITE_RENDER_RCA_AGENT_URL`
- `VITE_RENDER_CODEGEN_AGENT_URL`
- `VITE_RENDER_AUTOFIX_AGENT_URL`
- `VITE_RENDER_KNOWLEDGE_UPLOAD_URL`

Optional server-side proxy equivalents are also listed in `render.yaml`:

- `RENDER_KNOWLEDGE_AGENT_URL`
- `RENDER_RCA_AGENT_URL`
- `RENDER_CODEGEN_AGENT_URL`
- `RENDER_AUTOFIX_AGENT_URL`
- `RENDER_KNOWLEDGE_UPLOAD_URL`

## Local production check

```bash
npm run build
npm run start
```

The app listens on `process.env.PORT` in production, which Render injects automatically.

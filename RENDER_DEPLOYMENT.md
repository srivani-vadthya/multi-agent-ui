# Render Deployment Guide

## Step 1: Add Environment Variables in Render

Go to your Render Dashboard → Your Web Service → Environment → Add Environment Variables

Add these variables:

```
RENDER_KNOWLEDGE_AGENT_URL=https://knowledge-agent-sode.onrender.com
RENDER_RCA_AGENT_URL=https://patchly-rca-agent-2.onrender.com
RENDER_CODEGEN_AGENT_URL=https://code-generator-wfye.onrender.com
RENDER_AUTOFIX_AGENT_URL=https://your-autofix-agent.onrender.com/chat
RENDER_KNOWLEDGE_UPLOAD_URL=https://knowledge-agent-sode.onrender.com/upload
VITE_RENDER_KNOWLEDGE_AGENT_URL=https://knowledge-agent-sode.onrender.com
VITE_RENDER_RCA_AGENT_URL=https://patchly-rca-agent-2.onrender.com
VITE_RENDER_CODEGEN_AGENT_URL=https://code-generator-wfye.onrender.com
VITE_RENDER_AUTOFIX_AGENT_URL=https://your-autofix-agent.onrender.com/chat
VITE_RENDER_KNOWLEDGE_UPLOAD_URL=https://knowledge-agent-sode.onrender.com/upload
NODE_ENV=production
```

## Step 2: Render Service Configuration

Make sure your Render service has these settings:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 22.x (matches your package.json)

## Step 3: Check Build Output

After adding environment variables, trigger a new deployment:
1. Go to Manual Deploy → Deploy latest commit
2. Watch the build logs for any errors
3. Check the service logs after deployment

## Common Issues

### Issue: "The agent encountered an error"

**Cause**: Environment variables not set or agent URLs are incorrect

**Solution**: 
1. Verify all environment variables are added in Render
2. Test each agent URL manually to ensure they're accessible
3. Check if agent URLs need `/ask` or other endpoints appended

### Issue: Agent returns JSON instead of text

**Cause**: Wrong endpoint being called

**Solution**: Already fixed in code - using `/ask` for knowledge agent

### Issue: CORS errors

**Cause**: Backend agents not allowing requests from your frontend domain

**Solution**: Contact backend agent owners to whitelist your Render domain

## Step 4: Test After Deployment

1. Open your Render URL
2. Try Knowledge Agent with a simple question
3. Check browser console (F12) for any errors
4. Check Render logs for server-side errors

## Debugging Tips

If still getting errors:
1. Check Render logs: Dashboard → Your Service → Logs
2. Look for error messages about missing env vars
3. Verify agent URLs are correct and accessible
4. Test agent endpoints directly with curl:

```bash
curl -X POST https://knowledge-agent-sode.onrender.com/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

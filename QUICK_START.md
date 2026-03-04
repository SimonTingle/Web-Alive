# Quick Start Guide

## Local Testing (Optional)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Deploy to GitHub

```bash
# Create a new repo on GitHub (no need to initialize)
# Then run these commands:

git remote add origin https://github.com/YOUR_USERNAME/web-alive.git
git branch -M main
git push -u origin main
```

## Deploy to Vercel

### Method 1: Quick Deploy (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Click "Deploy"
5. Your app is live! 🎉

### Method 2: Manual Deploy

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy.

## Using Web Alive

### Basic Usage

1. Open your deployed Vercel app
2. Enter website URLs in the 10 fields (e.g., `https://myapp.render.com`)
3. Set check intervals (default: 5 minutes)
4. Click **"Check Status Now"** - you'll see green/red dots
5. Click **"Start Auto-Check"** to keep apps alive while the page is open

### For 24/7 Monitoring

**Option A: Vercel Pro + Cron (Most Reliable)**
1. Upgrade to Vercel Pro ($20/month)
2. Go to project Settings → Environment Variables
3. Add `CRON_SITES_JSON`:
```
[{"url":"https://myapp.render.com","interval":5}]
```
4. The cron job will automatically run every 5 minutes

**Option B: Free Cron Service**
1. Go to [cron-job.org](https://cron-job.org) or similar
2. Create a new cron job
3. Set it to make a POST request to:
```
https://your-vercel-app.vercel.app/api/ping-all
```
4. Send this JSON as body:
```json
{
  "sites": [
    {"url":"https://myapp.render.com","interval":5}
  ]
}
```
5. Schedule it to run every 5 minutes

**Option C: Keep Tab Open**
Just leave the app open with "Start Auto-Check" running. Works great if you have a server running the browser.

## Example Configuration

```json
{
  "url": "https://myapp.render.com",
  "interval": 5
}
```

This means: Check this URL every 5 minutes to keep it awake.

## Troubleshooting

**"Sites showing Down but they're up?"**
- The website might block automated requests
- Try accessing it manually in your browser first

**"Auto-check isn't working?"**
- Keep the browser tab open
- Check your browser console for errors

**"Cron job not running?"**
- You need Vercel Pro for cron support
- Or use an external service like cron-job.org

## Next Steps

1. ✅ Deploy to GitHub
2. ✅ Deploy to Vercel
3. ✅ Configure your websites
4. ✅ Set up 24/7 monitoring (cron or keep tab open)
5. ✅ Your apps now stay alive! 🚀

## Support

Check `README.md` for detailed documentation.

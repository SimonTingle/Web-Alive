# 🌐 Web Alive

Keep your web apps alive with periodic health checks. Prevent Render, Railway, and other services from sleeping by periodically pinging your deployed apps.

## Features

✅ **10 Configurable Website Slots** - Add up to 10 websites with custom check intervals
✅ **Live Status Indicators** - Green dot for live, red dot for down
✅ **Real-time Health Checks** - Click to check any website's status
✅ **Auto-Check Mode** - Continuously monitor websites while app is open
✅ **Vercel Deployment** - Deploy in seconds on Vercel
✅ **Headless Monitoring** - Use Vercel Cron or external services for 24/7 monitoring

## Why Web Alive?

Services like Render have a **15-minute inactivity timeout** on free plans. If your app isn't accessed, it goes to sleep. Web Alive keeps your apps **awake** by making periodic health check requests.

## Getting Started

### 1. Deploy to Vercel

```bash
# Clone/fork this repo
git clone https://github.com/yourusername/web-alive
cd web-alive

# Install dependencies
npm install

# Deploy to Vercel
npm install -g vercel
vercel
```

### 2. Use the Web Interface

1. Open your deployed Vercel app
2. Enter your website URLs (e.g., `https://myapp.render.com`)
3. Set check intervals (in minutes)
4. Click **"Check Status Now"** to test
5. Click **"Start Auto-Check"** to keep apps alive while the page is open

## Setup Headless Monitoring (24/7)

### Option A: Vercel Cron (Recommended for Pro Plan Users)

The app includes a cron endpoint that runs on Vercel's schedule.

**Setup:**
1. Set the `CRON_SITES_JSON` environment variable in Vercel project settings:

```json
[
  { "url": "https://myapp.render.com", "interval": 5 },
  { "url": "https://another-app.render.com", "interval": 10 }
]
```

2. The cron job will automatically run every 5 minutes (configured in `vercel.json`)

### Option B: External Cron Service (Free)

Use services like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Get your site configuration as JSON
2. Make a POST request to your Vercel app's `/api/ping-all` endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/ping-all \
  -H "Content-Type: application/json" \
  -d '{
    "sites": [
      { "url": "https://myapp.render.com", "interval": 5 },
      { "url": "https://another-app.render.com", "interval": 10 }
    ]
  }'
```

3. Schedule this request to run every 5 minutes in your chosen cron service

### Option C: Keep App Open (Simple)

Just leave the Web Alive tab open on your computer or server with auto-check enabled.

## API Endpoints

### Check Single URL Status
```
GET /api/check-status?url=https://example.com
```

Response:
```json
{
  "status": "up",
  "statusCode": 200,
  "responseTime": 234,
  "url": "https://example.com"
}
```

### Ping Multiple Sites
```
POST /api/ping-all
Content-Type: application/json

{
  "sites": [
    { "url": "https://myapp.render.com", "interval": 5 },
    { "url": "https://another-app.render.com", "interval": 10 }
  ]
}
```

Response:
```json
{
  "timestamp": "2024-03-04T12:34:56.789Z",
  "totalSites": 2,
  "successfulPings": 2,
  "results": [
    { "url": "https://myapp.render.com", "status": "success", "statusCode": 200, "responseTime": 234 },
    { "url": "https://another-app.render.com", "status": "success", "statusCode": 200, "responseTime": 189 }
  ]
}
```

### Vercel Cron Ping
```
GET /api/cron-ping
```

Automatically called by Vercel every 5 minutes (when using Vercel Pro with cron support).

## Configuration

### Environment Variables

Set these in your Vercel project settings:

- `CRON_SITES_JSON` - JSON array of sites to monitor with cron (see Vercel Cron section above)

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

### Project Structure

```
web-alive/
├── pages/
│   ├── api/
│   │   ├── check-status.js    # Check single URL status
│   │   ├── ping-all.js        # Ping multiple URLs
│   │   └── cron-ping.js       # Vercel cron endpoint
│   ├── _app.js                # Next.js app wrapper
│   └── index.js               # Main UI
├── styles/
│   └── globals.css            # Global styles
├── public/                     # Static files
├── package.json
├── tailwind.config.js
├── next.config.js
└── vercel.json                # Vercel configuration
```

## How It Works

1. **Frontend** - React app lets you configure websites and intervals
2. **Local Storage** - Configuration is saved in your browser
3. **Status Checking** - Makes HTTP requests to check if sites are responding
4. **Auto-Check** - JavaScript interval pings sites every 60 seconds while app is open
5. **Headless Mode** - Vercel cron or external services periodically call `/api/ping-all` or `/api/cron-ping`

## Supported Services

Web Alive works with any service that uses inactivity timeouts:

- **Render** (15-min timeout on free plan)
- **Railway** (hibernation on free plan)
- **Cyclic.sh**
- **Replit** (free tier)
- **Heroku** (deprecated but previously had sleep timeouts)
- Any custom-deployed app that needs periodic pinging

## Troubleshooting

### Sites showing "Down" but they're actually up

- The service might be blocking automated requests
- Check CORS policies
- Try accessing the URL directly in your browser
- Some services require authentication

### Auto-check not working

- The page must remain open
- Check your browser's console for errors
- Ensure the website URL is valid and accessible

### Cron not running

- Verify Vercel Pro plan (required for cron)
- Check `vercel.json` configuration
- View logs in Vercel dashboard

## Performance Notes

- Each health check makes an HTTP request (HEAD request preferred, falls back to GET)
- Default timeout is 10 seconds per request
- Concurrent requests to all sites to minimize total time
- Typical check takes 200-500ms depending on site latency

## Security

- No sensitive data is stored or transmitted
- Configuration is stored locally in your browser
- For cron setup, use Vercel's environment variables (private)
- All requests are made server-side from Vercel (no client-side cross-origin issues)

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

---

**Need help?** Check the [GitHub Issues](https://github.com/yourusername/web-alive/issues)

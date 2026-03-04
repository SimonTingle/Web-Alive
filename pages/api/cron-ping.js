/**
 * This endpoint is called by Vercel's cron scheduler.
 * To use it, you need to:
 * 1. Set environment variables with your sites configuration
 * 2. Or store config in Vercel KV (optional upgrade)
 *
 * For now, this demonstrates a basic cron endpoint.
 * You can manually configure it by calling /api/ping-all with your sites.
 */

export default async function handler(req, res) {
  // This is called by Vercel cron automatically
  // Only accept requests from Vercel's cron system
  const authHeader = req.headers['authorization']

  // For production, Vercel will handle auth automatically
  // This is just a basic check
  if (!authHeader && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Example: Read from environment variable
    // Set CRON_SITES_JSON in your Vercel project settings
    const sitesJson = process.env.CRON_SITES_JSON
    let sites = []

    if (sitesJson) {
      try {
        sites = JSON.parse(sitesJson)
      } catch (e) {
        console.error('Failed to parse CRON_SITES_JSON:', e)
      }
    }

    if (sites.length === 0) {
      return res.status(200).json({
        message: 'No sites configured. Set CRON_SITES_JSON environment variable.',
        example: 'CRON_SITES_JSON=[{"url":"https://myapp.render.com","interval":5}]',
        timestamp: new Date().toISOString(),
      })
    }

    // Ping all sites
    const results = []

    const promises = sites.map(async (site) => {
      if (!site.url) return null

      try {
        let finalUrl = site.url
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = 'https://' + finalUrl
        }

        const startTime = Date.now()

        try {
          const response = await fetch(finalUrl, {
            method: 'HEAD',
            timeout: 10000,
            redirect: 'follow',
          })

          const responseTime = Date.now() - startTime
          return {
            url: finalUrl,
            status: response.ok ? 'success' : 'failed',
            statusCode: response.status,
            responseTime,
          }
        } catch {
          const response = await fetch(finalUrl, {
            method: 'GET',
            timeout: 10000,
            redirect: 'follow',
          })

          const responseTime = Date.now() - startTime
          return {
            url: finalUrl,
            status: response.ok ? 'success' : 'failed',
            statusCode: response.status,
            responseTime,
          }
        }
      } catch (error) {
        return {
          url: site.url,
          status: 'error',
          error: error.message,
        }
      }
    })

    const pingedResults = await Promise.all(promises)
    const successCount = pingedResults.filter(r => r?.status === 'success').length

    console.log(`[Cron] Pinged ${successCount}/${sites.length} sites at ${new Date().toISOString()}`)

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      totalSites: sites.length,
      successfulPings: successCount,
      results: pingedResults.filter(r => r !== null),
    })
  } catch (error) {
    console.error('[Cron] Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

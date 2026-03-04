/**
 * This endpoint is designed to be called by a Vercel Cron job or external service
 * to ping all configured URLs and keep them alive.
 *
 * You can call this endpoint via:
 * - Vercel Cron (see vercel.json for configuration)
 * - External services like cron-job.org
 * - Your frontend's auto-check feature
 */

export default async function handler(req, res) {
  try {
    // Accept both GET and POST requests
    const sites = req.body?.sites || req.query?.sites

    if (!sites || !Array.isArray(sites)) {
      return res.status(400).json({
        error: 'Sites array is required',
        example: {
          sites: [
            { url: 'https://myapp.render.com', interval: 5 },
            { url: 'https://another-app.render.com', interval: 10 },
          ],
        },
      })
    }

    const results = []

    // Ping all sites concurrently
    const promises = sites.map(async (site) => {
      if (!site.url) return null

      try {
        let finalUrl = site.url
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = 'https://' + finalUrl
        }

        const startTime = Date.now()

        try {
          // Try HEAD first
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
          // Fall back to GET
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

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      totalSites: sites.length,
      successfulPings: successCount,
      results: pingedResults.filter(r => r !== null),
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
}

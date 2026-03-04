export default async function handler(req, res) {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const startTime = Date.now()

    // Ensure URL has protocol
    let finalUrl = url
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    const response = await fetch(finalUrl, {
      method: 'HEAD',
      timeout: 10000,
      redirect: 'follow',
    }).catch(() => {
      // If HEAD request fails, try GET
      return fetch(finalUrl, {
        method: 'GET',
        timeout: 10000,
        redirect: 'follow',
      })
    })

    const responseTime = Date.now() - startTime
    const status = response.ok ? 'up' : 'down'

    return res.status(200).json({
      status,
      statusCode: response.status,
      responseTime,
      url: finalUrl,
    })
  } catch (error) {
    console.error(`Error checking ${url}:`, error)
    return res.status(200).json({
      status: 'down',
      error: error.message,
      url,
    })
  }
}

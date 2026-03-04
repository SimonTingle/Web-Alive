import { useState, useEffect } from 'react'

const NUM_SITES = 10

export default function Home() {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const [autoCheckInterval, setAutoCheckInterval] = useState(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('web-alive-sites')
    if (saved) {
      setSites(JSON.parse(saved))
    } else {
      // Initialize with empty sites
      setSites(Array(NUM_SITES).fill(null).map(() => ({ url: '', interval: 5, status: null })))
    }
  }, [])

  // Save to localStorage whenever sites change
  useEffect(() => {
    if (sites.length > 0) {
      localStorage.setItem('web-alive-sites', JSON.stringify(sites))
    }
  }, [sites])

  const updateSite = (index, field, value) => {
    const newSites = [...sites]
    newSites[index] = { ...newSites[index], [field]: value }
    setSites(newSites)
  }

  const checkStatus = async (url) => {
    if (!url) return null
    try {
      const response = await fetch(`/api/check-status?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      return data.status
    } catch (error) {
      console.error(`Error checking ${url}:`, error)
      return 'error'
    }
  }

  const checkAllStatuses = async () => {
    setLoading(true)
    const updatedSites = await Promise.all(
      sites.map(async (site) => {
        if (!site.url) return { ...site, status: null }
        const status = await checkStatus(site.url)
        return { ...site, status }
      })
    )
    setSites(updatedSites)
    setLastChecked(new Date().toLocaleTimeString())
    setLoading(false)
  }

  const startAutoCheck = () => {
    // Check immediately
    checkAllStatuses()

    // Set up interval to check all sites
    const interval = setInterval(() => {
      checkAllStatuses()
    }, 60000) // Check every minute

    setAutoCheckInterval(interval)
  }

  const stopAutoCheck = () => {
    if (autoCheckInterval) {
      clearInterval(autoCheckInterval)
      setAutoCheckInterval(null)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'up') return 'bg-green-500'
    if (status === 'down') return 'bg-red-500'
    return 'bg-gray-400'
  }

  const getStatusText = (status) => {
    if (status === 'up') return 'Live'
    if (status === 'down') return 'Down'
    return 'Unchecked'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🌐 Web Alive</h1>
          <p className="text-slate-300">Keep your apps alive with periodic health checks</p>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-700 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col">
              <button
                onClick={checkAllStatuses}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {loading ? 'Checking...' : 'Check Status Now'}
              </button>
              {lastChecked && (
                <p className="text-sm text-slate-300 mt-2">Last checked: {lastChecked}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={startAutoCheck}
                disabled={autoCheckInterval !== null}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
              >
                Start Auto-Check
              </button>
              <button
                onClick={stopAutoCheck}
                disabled={autoCheckInterval === null}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
              >
                Stop
              </button>
            </div>
          </div>

          {autoCheckInterval && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded text-green-300 text-sm">
              ✓ Auto-check is running (checks every minute)
            </div>
          )}
        </div>

        {/* Sites List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">Website Configuration</h2>

          {sites.map((site, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-end">
              {/* Status Dot */}
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full ${getStatusColor(site.status)} mb-1`}></div>
                <span className="text-xs text-slate-400">{getStatusText(site.status)}</span>
              </div>

              {/* URL Input */}
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://myapp.render.com"
                  value={site.url}
                  onChange={(e) => updateSite(index, 'url', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 text-white placeholder-slate-400 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Interval Input */}
              <div className="w-32">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Minutes</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={site.interval}
                  onChange={(e) => updateSite(index, 'interval', parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Check Button */}
              <button
                onClick={() => checkStatus(site.url).then(status => {
                  const newSites = [...sites]
                  newSites[index].status = status
                  setSites(newSites)
                })}
                disabled={!site.url || loading}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded font-semibold disabled:opacity-50 transition whitespace-nowrap"
              >
                Check
              </button>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">ℹ️ How to use with Vercel Cron</h3>
          <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
            <li>Configure your website URLs and check intervals above</li>
            <li>Click "Check Status Now" to verify your setup works</li>
            <li>Use "Start Auto-Check" to keep apps alive while the page is open</li>
            <li>For 24/7 monitoring, set up a Vercel cron job (see GitHub repo)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

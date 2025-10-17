'use client'

import { useState } from 'react'

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const seedEvents = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/seed-events', {
        method: 'POST',
      })
      const data = await response.json()
      setResult({ success: response.ok, data })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Seed Events</h1>
        
        <p className="text-gray-600 mb-6">
          Click the button below to populate the database with the 4 example events.
        </p>

        <button
          onClick={seedEvents}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Seeding...' : 'Seed Events'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-bold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✓ Success' : '✗ Error'}
            </h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result.data || result.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

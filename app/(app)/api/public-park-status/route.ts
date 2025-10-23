import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Type for park status
type ParkStatusType = {
  id: string | number
  status: 'open' | 'closed'
  message?: string
  updatedAt: string
  createdAt: string
}

// Only handle GET for frontend - Payload handles all admin operations
export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Fetch the most recently edited park status
    const result = await payload.find({
      collection: 'park-status' as any,
      limit: 1,
      sort: '-updatedAt',
    })

    if (result.docs.length === 0) {
      // Return default closed status if no status found at all
      return NextResponse.json({
        status: 'closed',
        message: null,
        updatedAt: new Date().toISOString(),
      })
    }

    const parkStatus = result.docs[0] as ParkStatusType

    return NextResponse.json({
      status: parkStatus.status,
      message: parkStatus.message || null,
      updatedAt: parkStatus.updatedAt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch park status' },
      { status: 500 }
    )
  }
}

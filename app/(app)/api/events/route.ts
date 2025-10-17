import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const events = await payload.find({
      collection: 'events' as any,
      limit: 100,
      sort: 'date',
    })

    // Transform Payload events to match frontend Event type
    const transformedEvents = events.docs.map((event: any) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      description: event.description,
      imageUrl: event.imageUrl,
      category: event.category,
      featured: event.featured,
    }))

    return NextResponse.json(transformedEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

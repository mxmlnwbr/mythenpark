import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST() {
  try {
    const payload = await getPayload({ config })

    const events = [
      {
        title: 'Winter Snowboard Championship',
        date: 'December 15, 2025',
        description:
          'Join us for the annual snowboard championship with professional riders from all over Switzerland. Spectacular jumps, amazing tricks, and great atmosphere guaranteed!',
        imageUrl: '/Mythenpark-Logo.jpg',
        category: 'competition',
        featured: true,
      },
      {
        title: 'Freestyle Workshop with Pro Riders',
        date: 'January 20, 2026',
        description:
          'Learn from the best! Our pro riders will teach you advanced freestyle techniques, from basic jumps to complex aerial maneuvers. All skill levels welcome.',
        imageUrl: '/Mythenpark-Logo.jpg',
        category: 'workshop',
        featured: false,
      },
      {
        title: 'Night Ride Special',
        date: 'February 5, 2026',
        description:
          'Experience Mythenpark under the stars! Our special night ride event includes illuminated obstacles, hot drinks, and music. A magical winter experience you won\'t forget.',
        imageUrl: '/Mythenpark-Logo.jpg',
        category: 'special',
        featured: true,
      },
      {
        title: 'Kids Snow Day',
        date: 'February 12, 2026',
        description:
          'A fun day dedicated to our youngest snow enthusiasts! Child-friendly obstacles, games, and professional instructors to help kids improve their skills while having fun.',
        imageUrl: '/Mythenpark-Logo.jpg',
        category: 'special',
        featured: false,
      },
    ]

    // Check if events already exist
    const existingEvents = await payload.find({
      collection: 'events' as any,
      limit: 1,
    })

    if (existingEvents.totalDocs > 0) {
      return NextResponse.json(
        { message: 'Events already exist. No seeding needed.', count: existingEvents.totalDocs },
        { status: 200 }
      )
    }

    // Create each event
    const created = []
    for (const event of events) {
      const result = await payload.create({
        collection: 'events' as any,
        data: event as any,
      })
      created.push(result)
    }

    return NextResponse.json(
      { 
        message: 'Events seeded successfully!',
        count: created.length,
        events: created.map(e => ({ id: (e as any).id, title: (e as any).title }))
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error seeding events:', error)
    return NextResponse.json(
      { error: 'Failed to seed events', details: error.message },
      { status: 500 }
    )
  }
}

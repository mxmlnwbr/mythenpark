import { getPayload } from 'payload'
import config from './payload.config'

const seedEvents = async () => {
  const payload = await getPayload({ config })

  console.log('Seeding events...')

  const events = [
    {
      title: 'Winter Snowboard Championship',
      date: '2025-12-15',
      description:
        'Join us for the annual snowboard championship with professional riders from all over Switzerland. Spectacular jumps, amazing tricks, and great atmosphere guaranteed!',
      imageUrl: '/Mythenpark-Logo.jpg',
      category: 'competition',
      featured: true,
    },
    {
      title: 'Freestyle Workshop with Pro Riders',
      date: '2026-01-20',
      description:
        'Learn from the best! Our pro riders will teach you advanced freestyle techniques, from basic jumps to complex aerial maneuvers. All skill levels welcome.',
      imageUrl: '/Mythenpark-Logo.jpg',
      category: 'workshop',
      featured: false,
    },
    {
      title: 'Night Ride Special',
      date: '2026-02-05',
      description:
        'Experience Mythenpark under the stars! Our special night ride event includes illuminated obstacles, hot drinks, and music. A magical winter experience you won\'t forget.',
      imageUrl: '/Mythenpark-Logo.jpg',
      category: 'special',
      featured: true,
    },
    {
      title: 'Kids Snow Day',
      date: '2026-02-12',
      description:
        'A fun day dedicated to our youngest snow enthusiasts! Child-friendly obstacles, games, and professional instructors to help kids improve their skills while having fun.',
      imageUrl: '/Mythenpark-Logo.jpg',
      category: 'special',
      featured: false,
    },
  ]

  try {
    // Check if events already exist
    const existingEvents = await payload.find({
      collection: 'events' as any,
      limit: 1,
    })

    if (existingEvents.totalDocs > 0) {
      console.log('Events already exist. Skipping seed.')
      process.exit(0)
    }

    // Create each event
    for (const event of events) {
      await payload.create({
        collection: 'events' as any,
        data: event as any,
      })
      console.log(`✓ Created event: ${event.title}`)
    }

    console.log('✓ All events seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding events:', error)
    process.exit(1)
  }
}

seedEvents()

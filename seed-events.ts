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
      duration: 'Full Day',
      location: 'Mythenpark Main Slope',
      whatToExpect: [
        { item: 'Professional judges and timing system' },
        { item: 'Live commentary and music' },
        { item: 'Prize ceremony with awards' },
        { item: 'Food and drink available' },
      ],
    },
    {
      title: 'Freestyle Workshop with Pro Riders',
      date: '2026-01-20',
      description:
        'Learn from the best! Our pro riders will teach you advanced freestyle techniques, from basic jumps to complex aerial maneuvers. All skill levels welcome.',
      imageUrl: '/Mythenpark-Logo.jpg',
      category: 'workshop',
      featured: false,
      duration: 'Half Day (4 hours)',
      location: 'Mythenpark Training Area',
      whatToExpect: [
        { item: 'Expert instruction from pro riders' },
        { item: 'Small group sizes for personalized coaching' },
        { item: 'Video analysis of your technique' },
        { item: 'Safety equipment provided' },
      ],
    },
    {
      title: 'Night Ride Special',
      date: '2026-02-05',
      description:
        'Experience Mythenpark under the stars! Our special night ride event includes illuminated obstacles, hot drinks, and music. A magical winter experience you won\'t forget.',
      imageUrl: '/Mythenpark-Logo.jpg',
      category: 'special',
      featured: true,
      duration: 'Evening (3 hours)',
      location: 'Mythenpark Full Course',
      whatToExpect: [
        { item: 'LED-illuminated obstacles and course' },
        { item: 'DJ and music throughout' },
        { item: 'Hot chocolate and mulled wine' },
        { item: 'Special night riding atmosphere' },
      ],
    },
    {
      title: 'Kids Snow Day',
      date: '2026-02-12',
      description:
        'A fun day dedicated to our youngest snow enthusiasts! Child-friendly obstacles, games, and professional instructors to help kids improve their skills while having fun.',
      imageUrl: '/Mythenpark-Logo.jpg',
      category: 'special',
      featured: false,
      duration: 'Full Day',
      location: 'Mythenpark Kids Zone',
      whatToExpect: [
        { item: 'Age-appropriate obstacles and activities' },
        { item: 'Certified children\'s instructors' },
        { item: 'Fun games and competitions' },
        { item: 'Snacks and refreshments for kids' },
      ],
    },
  ]

  try {
    // Delete all existing events first
    const existingEvents = await payload.find({
      collection: 'events' as any,
      limit: 0, // Get all events
    })

    if (existingEvents.totalDocs > 0) {
      console.log(`Found ${existingEvents.totalDocs} existing events. Deleting...`)
      
      // Delete each existing event
      for (const event of existingEvents.docs) {
        await payload.delete({
          collection: 'events' as any,
          id: event.id,
        })
        console.log(`✗ Deleted event: ${event.title}`)
      }
      
      console.log('✓ All existing events deleted.')
    } else {
      console.log('No existing events found.')
    }

    // Create new events
    console.log('Creating new events...')
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

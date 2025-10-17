import { getPayload } from 'payload'
import config from '../payload.config'

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...')

    // Set environment variable to auto-accept schema changes
    process.env.PAYLOAD_ACCEPT_MIGRATIONS = 'true'

    // Initialize Payload CMS (creates all Payload tables and runs migrations)
    console.log('📦 Initializing Payload CMS...')
    const payload = await getPayload({ config })
    console.log('✓ Payload CMS initialized')

    // Payload automatically handles both Payload tables and Drizzle migrations
    console.log('✓ All database tables created')

    console.log('✓ Database initialization complete!')
    console.log('📝 Your database is ready to use.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()

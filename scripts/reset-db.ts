import { sql } from '@vercel/postgres'
import { getPayload } from 'payload'
import config from '../payload.config'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { migrate } from 'drizzle-orm/vercel-postgres/migrator'
import * as schema from '../db/schema'

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting complete database reset...')
    console.log('')

    // Step 1: Drop all existing tables
    console.log('📋 Step 1: Dropping all existing tables...')
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `

    const tables = tablesResult.rows.map((row: any) => row.table_name)

    if (tables.length === 0) {
      console.log('   ✓ No tables to drop')
    } else {
      console.log(`   Found ${tables.length} table(s) to drop`)

      // Drop all tables with CASCADE to handle foreign keys
      for (const table of tables) {
        const escapedTable = `"${table.replace(/"/g, '""')}"`
        const query = `DROP TABLE IF EXISTS ${escapedTable} CASCADE`
        await sql.query(query)
        console.log(`   ✓ Dropped: ${table}`)
      }
    }
    console.log('   ✓ All tables dropped')
    console.log('')

    // Step 2: Initialize Payload CMS (creates Payload tables)
    console.log('📦 Step 2: Initializing Payload CMS collections...')
    process.env.PAYLOAD_ACCEPT_MIGRATIONS = 'true'
    
    const payload = await getPayload({ config })
    console.log('   ✓ Payload tables created (Users, Media, Events)')
    console.log('')

    // Step 3: Push Drizzle schema
    console.log('🗄️  Step 3: Pushing Drizzle schema...')
    const db = drizzle(sql, { schema })
    
    // Create Drizzle tables directly from schema
    await sql`
      CREATE TABLE IF NOT EXISTS event_votes (
        event_id INTEGER PRIMARY KEY,
        vote_count INTEGER NOT NULL DEFAULT 0
      )
    `
    console.log('   ✓ Created: event_votes')

    await sql`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('   ✓ Created: event_registrations')
    console.log('')

    console.log('✅ Database reset complete!')
    console.log('')
    console.log('📝 Your database now includes:')
    console.log('   • Payload CMS collections (Users, Media, Events)')
    console.log('   • Drizzle tables (event_votes, event_registrations)')
    console.log('')
    console.log('💡 Next step: Run `pnpm run seed:events` to populate events (optional)')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    console.error(error)
    process.exit(1)
  }
}

resetDatabase()

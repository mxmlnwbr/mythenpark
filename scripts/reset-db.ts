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
    console.log('   ✓ Payload tables created (Users, Media, Events, EventRegistrations)')
    console.log('')

    // Step 3: Push Drizzle schema for custom tables
    console.log('🗄️  Step 3: Creating custom Drizzle tables...')
    const db = drizzle(sql, { schema })
    
    // Create event_votes table (not managed by Payload)
    await sql`
      CREATE TABLE IF NOT EXISTS event_votes (
        event_id INTEGER PRIMARY KEY,
        vote_count INTEGER NOT NULL DEFAULT 0
      )
    `
    console.log('   ✓ Created: event_votes')
    console.log('')

    console.log('✅ Database reset complete!')
    console.log('')
    console.log('📝 Your database now includes:')
    console.log('   • Payload CMS collections (Users, Media, Events, EventRegistrations)')
    console.log('   • Drizzle tables (event_votes)')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Start dev server: pnpm dev')
    console.log('   2. Visit /admin to manage event registrations')
    console.log('   3. Optionally run: pnpm run seed:events')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    console.error(error)
    process.exit(1)
  }
}

resetDatabase()

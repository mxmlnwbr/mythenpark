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
    console.log('   ✓ Payload tables created (Users, Media, Events, EventRegistrations, EventStatistics, EventVotes)')
    console.log('')

    console.log('✅ Database reset complete!')
    console.log('')
    console.log('📝 Your database now includes:')
    console.log('   • Payload CMS collections:')
    console.log('     - Users (authentication)')
    console.log('     - Media (file uploads)')
    console.log('     - Events (event management)')
    console.log('     - EventRegistrations (user sign-ups)')
    console.log('     - EventStatistics (join counters - read-only)')
    console.log('     - EventVotes (device-based vote tracking)')
    console.log('')
    console.log('💡 Next steps:')
    console.log('   1. Start dev server: npm run dev')
    console.log('   2. Visit /admin to create an admin user')
    console.log('   3. Optionally run: npm run seed:events')
    console.log('   4. Vote tracking uses device fingerprints - each device/browser can vote once per event')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    console.error(error)
    process.exit(1)
  }
}

resetDatabase()

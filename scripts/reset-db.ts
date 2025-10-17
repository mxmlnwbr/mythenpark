import { sql } from '@vercel/postgres'

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset...')

    // Get all tables
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `

    const tables = tablesResult.rows.map((row: any) => row.table_name)

    if (tables.length === 0) {
      console.log('✓ No tables to drop')
    } else {
      console.log(`📋 Found ${tables.length} table(s) to drop`)

      // Drop all tables with CASCADE to handle foreign keys
      for (const table of tables) {
        // Escape table name by wrapping in double quotes
        const escapedTable = `"${table.replace(/"/g, '""')}"`
        const query = `DROP TABLE IF EXISTS ${escapedTable} CASCADE`
        await sql.query(query)
        console.log(`✓ Dropped table: ${table}`)
      }
    }

    console.log('✓ Database reset complete!')
    console.log('📏 Next steps:')
    console.log('   1. Run: pnpm run db:init')
    console.log('   2. When prompted, select option 1 (create users_sessions table)')
    console.log('   3. Optionally run: pnpm run seed:events')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    process.exit(1)
  }
}

resetDatabase()

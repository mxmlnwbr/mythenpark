import { sql } from '@vercel/postgres'

const listTables = async () => {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    console.log(`\n📋 Found ${result.rows.length} table(s) in the database:\n`)
    result.rows.forEach((row: any, index: number) => {
      console.log(`   ${index + 1}. ${row.table_name}`)
    })
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error listing tables:', error)
    process.exit(1)
  }
}

listTables()

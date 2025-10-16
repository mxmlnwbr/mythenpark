import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Initialize database table
async function initTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS event_votes (
        event_id INTEGER PRIMARY KEY,
        vote_count INTEGER DEFAULT 0
      )
    `;
  } catch (error) {
    console.error('Error initializing table:', error);
  }
}

// Read all votes
async function readVotes(): Promise<Record<number, number>> {
  try {
    await initTable();
    const { rows } = await sql`SELECT event_id, vote_count FROM event_votes`;
    const votes: Record<number, number> = {};
    rows.forEach(row => {
      votes[row.event_id] = row.vote_count;
    });
    return votes;
  } catch (error) {
    console.error('Error reading votes:', error);
    return {};
  }
}

// Update vote for a specific event
async function updateVote(eventId: number, newCount: number) {
  try {
    await initTable();
    await sql`
      INSERT INTO event_votes (event_id, vote_count)
      VALUES (${eventId}, ${newCount})
      ON CONFLICT (event_id)
      DO UPDATE SET vote_count = ${newCount}
    `;
  } catch (error) {
    console.error('Error updating vote:', error);
    throw error;
  }
}

// GET: Retrieve all vote counts
export async function GET() {
  try {
    const votes = await readVotes();
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Error reading votes:', error);
    return NextResponse.json({ error: 'Failed to read votes' }, { status: 500 });
  }
}

// POST: Update vote for an event
export async function POST(request: NextRequest) {
  try {
    const { eventId, action } = await request.json();
    
    if (!eventId || !action || !['upvote', 'downvote'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const votes = await readVotes();
    const currentVotes = votes[eventId] || 0;
    
    let newCount = currentVotes;
    if (action === 'upvote') {
      newCount = currentVotes + 1;
    } else if (action === 'downvote' && currentVotes > 0) {
      newCount = currentVotes - 1;
    }
    
    await updateVote(eventId, newCount);
    
    return NextResponse.json({ 
      eventId, 
      votes: newCount
    });
  } catch (error) {
    console.error('Error updating votes:', error);
    return NextResponse.json({ error: 'Failed to update votes' }, { status: 500 });
  }
}

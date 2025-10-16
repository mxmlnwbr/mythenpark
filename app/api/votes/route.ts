import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/db';
import { eventVotes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from '@vercel/postgres';

// In-memory storage for local development (fallback when no DB)
let memoryVotes: Record<number, number> = {};

// Initialize database table (create if not exists)
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
  // Use in-memory storage if no database configured (local dev)
  if (!isDatabaseConfigured()) {
    console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Using IN-MEMORY storage. Votes:`, memoryVotes);
    return memoryVotes;
  }
  
  console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Using DATABASE storage`);
  
  try {
    await initTable();
    const allVotes = await db.select().from(eventVotes);
    const votes: Record<number, number> = {};
    allVotes.forEach(vote => {
      votes[vote.eventId] = vote.voteCount;
    });
    return votes;
  } catch (error) {
    console.error('Error reading votes:', error);
    return {};
  }
}

// Update vote for a specific event
async function updateVote(eventId: number, newCount: number) {
  // Use in-memory storage if no database configured (local dev)
  if (!isDatabaseConfigured()) {
    memoryVotes[eventId] = newCount;
    console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Updated IN-MEMORY storage:`, memoryVotes);
    return;
  }
  
  console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Updating DATABASE for event ${eventId} to ${newCount}`);
  
  try {
    await initTable();
    await db
      .insert(eventVotes)
      .values({ eventId, voteCount: newCount })
      .onConflictDoUpdate({
        target: eventVotes.eventId,
        set: { voteCount: newCount },
      });
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
    
    console.log(`[VOTE] Event ${eventId}: ${currentVotes} → ${newCount} (${action})`);
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

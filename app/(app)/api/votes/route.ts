import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/db';
import { eventVotes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from '@vercel/postgres';
import { getPayload } from 'payload';
import config from '@/payload.config';

// In-memory storage for local development (fallback when no DB)
let memoryVotes: Record<number, number> = {};

// Payload instance cache
let payloadInstance: any = null;

async function getPayloadInstance() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config });
  }
  return payloadInstance;
}

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

// Read all votes from Payload CMS
async function readVotes(): Promise<Record<number, number>> {
  try {
    const payload = await getPayloadInstance();
    const statistics = await payload.find({
      collection: 'event-statistics',
      limit: 1000,
    });
    
    const votes: Record<number, number> = {};
    statistics.docs.forEach((stat: any) => {
      votes[stat.eventId] = stat.joinCount || 0;
    });
    
    console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Read ${statistics.docs.length} vote counts from Payload`);
    return votes;
  } catch (error) {
    console.error('Error reading votes from Payload:', error);
    
    // Fallback to in-memory if Payload fails
    if (!isDatabaseConfigured()) {
      console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Fallback to IN-MEMORY storage. Votes:`, memoryVotes);
      return memoryVotes;
    }
    
    return {};
  }
}

// Update vote for a specific event in Payload CMS
async function updateVote(eventId: number, newCount: number, eventTitle?: string) {
  try {
    const payload = await getPayloadInstance();
    
    // Check if statistics entry exists
    const existing = await payload.find({
      collection: 'event-statistics',
      where: {
        eventId: {
          equals: eventId,
        },
      },
    });
    
    if (existing.docs.length > 0) {
      // Update existing entry
      await payload.update({
        collection: 'event-statistics',
        id: existing.docs[0].id,
        data: {
          joinCount: newCount,
          ...(eventTitle && { eventTitle }),
        },
      });
      console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Updated Payload statistics for event ${eventId} to ${newCount}`);
    } else {
      // Create new entry
      await payload.create({
        collection: 'event-statistics',
        data: {
          eventId,
          joinCount: newCount,
          eventTitle: eventTitle || `Event ${eventId}`,
        },
      });
      console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Created Payload statistics for event ${eventId} with ${newCount}`);
    }
  } catch (error) {
    console.error('Error updating vote in Payload:', error);
    
    // Fallback to in-memory storage if Payload fails
    if (!isDatabaseConfigured()) {
      memoryVotes[eventId] = newCount;
      console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Fallback: Updated IN-MEMORY storage:`, memoryVotes);
      return;
    }
    
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
    
    // Try to fetch event title for better admin experience
    let eventTitle;
    try {
      const payload = await getPayloadInstance();
      const event = await payload.findByID({
        collection: 'events',
        id: eventId.toString(),
      });
      eventTitle = event?.title;
    } catch (e) {
      // Event title is optional, continue without it
    }
    
    await updateVote(eventId, newCount, eventTitle);
    
    return NextResponse.json({ 
      eventId, 
      votes: newCount
    });
  } catch (error) {
    console.error('Error updating votes:', error);
    return NextResponse.json({ error: 'Failed to update votes' }, { status: 500 });
  }
}

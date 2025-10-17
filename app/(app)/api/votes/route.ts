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

// Note: deviceId is now sent from the client (browser fingerprint)
// No need to extract IP address server-side

// Helper: Check if device has voted for an event
async function hasVoted(deviceId: string, eventId: number): Promise<boolean> {
  try {
    const payload = await getPayloadInstance();
    const result = await payload.find({
      collection: 'event-votes',
      where: {
        and: [
          {
            deviceId: {
              equals: deviceId,
            },
          },
          {
            eventId: {
              equals: eventId,
            },
          },
        ],
      },
      limit: 1,
    });
    
    return result.docs.length > 0;
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

// Helper: Record a vote
async function recordVote(deviceId: string, eventId: number, eventTitle?: string): Promise<void> {
  try {
    const payload = await getPayloadInstance();
    await payload.create({
      collection: 'event-votes',
      data: {
        deviceId,
        eventId,
        eventTitle: eventTitle || `Event ${eventId}`,
      },
    });
    console.log(`[VOTE] Recorded vote from device ${deviceId.substring(0, 10)}... for event ${eventId}`);
  } catch (error) {
    console.error('Error recording vote:', error);
    throw error;
  }
}

// Helper: Remove a vote record
async function removeVote(deviceId: string, eventId: number): Promise<void> {
  try {
    const payload = await getPayloadInstance();
    const result = await payload.find({
      collection: 'event-votes',
      where: {
        and: [
          {
            deviceId: {
              equals: deviceId,
            },
          },
          {
            eventId: {
              equals: eventId,
            },
          },
        ],
      },
      limit: 1,
    });
    
    if (result.docs.length > 0) {
      await payload.delete({
        collection: 'event-votes',
        id: result.docs[0].id,
      });
      console.log(`[VOTE] Removed vote from device ${deviceId.substring(0, 10)}... for event ${eventId}`);
    }
  } catch (error) {
    console.error('Error removing vote:', error);
    throw error;
  }
}

// GET: Retrieve all vote counts and user's voting status
export async function GET(request: NextRequest) {
  try {
    const votes = await readVotes();
    
    // Get deviceId from query parameter
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    
    if (!deviceId) {
      // Return just vote counts without user status
      return NextResponse.json({
        votes,
        userVotes: [],
      });
    }
    
    // Check which events this device has voted for
    const payload = await getPayloadInstance();
    const userVotes = await payload.find({
      collection: 'event-votes',
      where: {
        deviceId: {
          equals: deviceId,
        },
      },
      limit: 1000,
    });
    
    const votedEventIds = userVotes.docs.map((vote: any) => vote.eventId);
    
    return NextResponse.json({
      votes,
      userVotes: votedEventIds,
    });
  } catch (error) {
    console.error('Error reading votes:', error);
    return NextResponse.json({ error: 'Failed to read votes' }, { status: 500 });
  }
}

// POST: Update vote for an event (with device tracking)
export async function POST(request: NextRequest) {
  try {
    const { eventId, action, deviceId } = await request.json();
    
    if (!eventId || !action || !['upvote', 'downvote'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }
    
    console.log(`[VOTE] Request from device ${deviceId.substring(0, 10)}...`);
    
    // Fetch event title first for recording
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
    
    // Check if device has already voted
    const alreadyVoted = await hasVoted(deviceId, eventId);
    
    // Handle upvote/downvote logic with IP tracking
    if (action === 'upvote') {
      if (alreadyVoted) {
        return NextResponse.json(
          { 
            error: 'Already participating', 
            message: "You're already participating in this event!",
            alreadyVoted: true,
          },
          { status: 400 }
        );
      }
      
      // Record the vote with event title
      await recordVote(deviceId, eventId, eventTitle);
    } else if (action === 'downvote') {
      if (!alreadyVoted) {
        return NextResponse.json(
          { error: 'Not participating', message: "You haven't joined this event yet." },
          { status: 400 }
        );
      }
      
      // Remove the vote record
      await removeVote(deviceId, eventId);
    }
    
    // Update vote counts
    const votes = await readVotes();
    const currentVotes = votes[eventId] || 0;
    
    let newCount = currentVotes;
    if (action === 'upvote') {
      newCount = currentVotes + 1;
    } else if (action === 'downvote' && currentVotes > 0) {
      newCount = currentVotes - 1;
    }
    
    console.log(`[VOTE] Event ${eventId}: ${currentVotes} → ${newCount} (${action})`);
    
    await updateVote(eventId, newCount, eventTitle);
    
    return NextResponse.json({ 
      eventId, 
      votes: newCount,
      alreadyVoted: action === 'upvote',
    });
  } catch (error) {
    console.error('Error updating votes:', error);
    return NextResponse.json({ error: 'Failed to update votes' }, { status: 500 });
  }
}

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

// Helper: Get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIp) {
    return realIp.trim();
  }
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  
  return 'unknown';
}

// Helper: Check if IP has voted for an event
async function hasVoted(ipAddress: string, eventId: number): Promise<boolean> {
  try {
    const payload = await getPayloadInstance();
    const result = await payload.find({
      collection: 'event-votes',
      where: {
        and: [
          {
            ipAddress: {
              equals: ipAddress,
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
async function recordVote(ipAddress: string, eventId: number, eventTitle?: string): Promise<void> {
  try {
    const payload = await getPayloadInstance();
    await payload.create({
      collection: 'event-votes',
      data: {
        ipAddress,
        eventId,
        eventTitle: eventTitle || `Event ${eventId}`,
      },
    });
    console.log(`[VOTE] Recorded vote from IP ${ipAddress} for event ${eventId}`);
  } catch (error) {
    console.error('Error recording vote:', error);
    throw error;
  }
}

// Helper: Remove a vote record
async function removeVote(ipAddress: string, eventId: number): Promise<void> {
  try {
    const payload = await getPayloadInstance();
    const result = await payload.find({
      collection: 'event-votes',
      where: {
        and: [
          {
            ipAddress: {
              equals: ipAddress,
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
      console.log(`[VOTE] Removed vote from IP ${ipAddress} for event ${eventId}`);
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
    
    // Get user's IP and check which events they've voted for
    const ipAddress = getClientIP(request);
    const payload = await getPayloadInstance();
    
    const userVotes = await payload.find({
      collection: 'event-votes',
      where: {
        ipAddress: {
          equals: ipAddress,
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

// POST: Update vote for an event (with IP tracking)
export async function POST(request: NextRequest) {
  try {
    const { eventId, action } = await request.json();
    
    if (!eventId || !action || !['upvote', 'downvote'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    // Get user's IP address
    const ipAddress = getClientIP(request);
    console.log(`[VOTE] Request from IP: ${ipAddress}`);
    
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
    
    // Check if user has already voted
    const alreadyVoted = await hasVoted(ipAddress, eventId);
    
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
      await recordVote(ipAddress, eventId, eventTitle);
    } else if (action === 'downvote') {
      if (!alreadyVoted) {
        return NextResponse.json(
          { error: 'Not participating', message: "You haven't joined this event yet." },
          { status: 400 }
        );
      }
      
      // Remove the vote record
      await removeVote(ipAddress, eventId);
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

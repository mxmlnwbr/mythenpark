import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to store votes data
const votesFilePath = path.join(process.cwd(), 'data', 'votes.json');

// Ensure data directory and file exist
function ensureVotesFile() {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(votesFilePath)) {
    fs.writeFileSync(votesFilePath, JSON.stringify({}));
  }
}

// Read votes from file
function readVotes(): Record<number, number> {
  ensureVotesFile();
  const data = fs.readFileSync(votesFilePath, 'utf-8');
  return JSON.parse(data);
}

// Write votes to file
function writeVotes(votes: Record<number, number>) {
  ensureVotesFile();
  fs.writeFileSync(votesFilePath, JSON.stringify(votes, null, 2));
}

// GET: Retrieve all vote counts
export async function GET() {
  try {
    const votes = readVotes();
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
    
    const votes = readVotes();
    const currentVotes = votes[eventId] || 0;
    
    if (action === 'upvote') {
      votes[eventId] = currentVotes + 1;
    } else if (action === 'downvote' && currentVotes > 0) {
      votes[eventId] = currentVotes - 1;
    }
    
    writeVotes(votes);
    
    return NextResponse.json({ 
      eventId, 
      votes: votes[eventId] 
    });
  } catch (error) {
    console.error('Error updating votes:', error);
    return NextResponse.json({ error: 'Failed to update votes' }, { status: 500 });
  }
}

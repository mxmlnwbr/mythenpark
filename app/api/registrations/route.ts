import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/db';
import { eventRegistrations } from '@/db/schema';
import { sql } from '@vercel/postgres';
import { eq } from 'drizzle-orm';

// In-memory storage for local development
let memoryRegistrations: Array<{
  id: number;
  eventId: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}> = [];
let nextId = 1;

// Initialize database table
async function initTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
  } catch (error) {
    console.error('Error initializing registrations table:', error);
  }
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST: Register for an event
export async function POST(request: NextRequest) {
  try {
    const { eventId, firstName, lastName, email } = await request.json();
    
    // Validation
    if (!eventId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate firstName and lastName (letters, spaces, hyphens only)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(firstName) || firstName.length < 2 || firstName.length > 100) {
      return NextResponse.json(
        { error: 'First name must be 2-100 characters and contain only letters' },
        { status: 400 }
      );
    }
    
    if (!nameRegex.test(lastName) || lastName.length < 2 || lastName.length > 100) {
      return NextResponse.json(
        { error: 'Last name must be 2-100 characters and contain only letters' },
        { status: 400 }
      );
    }
    
    // Validate email
    if (!isValidEmail(email) || email.length > 255) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Trim input
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    // Save registration
    if (!isDatabaseConfigured()) {
      // Use in-memory storage for dev
      const registration = {
        id: nextId++,
        eventId,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        createdAt: new Date(),
      };
      memoryRegistrations.push(registration);
      console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Registration saved to memory:`, registration);
      
      return NextResponse.json({
        success: true,
        registration: {
          id: registration.id,
          eventId: registration.eventId,
        },
      });
    }
    
    // Use database for production
    console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Saving registration to database`);
    await initTable();
    
    const result = await db
      .insert(eventRegistrations)
      .values({
        eventId,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
      })
      .returning({ id: eventRegistrations.id, eventId: eventRegistrations.eventId });
    
    return NextResponse.json({
      success: true,
      registration: result[0],
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

// GET: Retrieve registrations for an event (optional - for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }
    
    if (!isDatabaseConfigured()) {
      const registrations = memoryRegistrations.filter(
        (r) => r.eventId === parseInt(eventId)
      );
      return NextResponse.json({ count: registrations.length, registrations });
    }
    
    await initTable();
    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, parseInt(eventId)));
    
    return NextResponse.json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

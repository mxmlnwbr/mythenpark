import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Get Payload instance
let payloadInstance: any = null;

async function getPayloadInstance() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config });
  }
  return payloadInstance;
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
    
    // Save registration using Payload CMS
    const payload = await getPayloadInstance();
    
    const registration = await payload.create({
      collection: 'event-registrations',
      data: {
        eventId,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
      },
    });
    
    console.log(`Registration saved via Payload CMS:`, registration.id);
    
    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        eventId: registration.eventId,
      },
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
    
    const payload = await getPayloadInstance();
    
    const result = await payload.find({
      collection: 'event-registrations',
      where: {
        eventId: {
          equals: parseInt(eventId),
        },
      },
    });
    
    return NextResponse.json({
      count: result.totalDocs,
      registrations: result.docs,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

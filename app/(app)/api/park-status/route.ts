import { NextResponse, NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Type for park status
type ParkStatusType = {
  id: string;
  status: 'open' | 'closed';
  message?: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
};

export async function GET() {
  try {
    const payload = await getPayload({ config });
    
    console.log('GET /api/park-status called');
    
    // Fetch all park statuses first to debug
    const allResult = await payload.find({
      collection: 'park-status' as any,
      limit: 10,
    });
    
    console.log('All park statuses:', allResult.docs);
    
    // Fetch the active park status
    const result = await payload.find({
      collection: 'park-status' as any,
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
      sort: '-updatedAt',
    });

    console.log('Park status query result (active only):', result);

    if (result.docs.length === 0) {
      // If no active status, get the most recent one
      console.log('No active park status found, getting most recent');
      const recentResult = await payload.find({
        collection: 'park-status' as any,
        limit: 1,
        sort: '-updatedAt',
      });
      
      if (recentResult.docs.length > 0) {
        const parkStatus = recentResult.docs[0] as ParkStatusType;
        console.log('Returning most recent park status:', parkStatus);
        return NextResponse.json({
          status: parkStatus.status,
          message: parkStatus.message || null,
          updatedAt: parkStatus.updatedAt,
        });
      }
      
      // Return default closed status if no status found at all
      console.log('No park statuses found, returning default closed');
      return NextResponse.json({
        status: 'closed',
        message: null,
        updatedAt: new Date().toISOString(),
      });
    }

    const parkStatus = result.docs[0] as ParkStatusType;
    console.log('Returning park status:', parkStatus);
    
    return NextResponse.json({
      status: parkStatus.status,
      message: parkStatus.message || null,
      updatedAt: parkStatus.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching park status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch park status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    
    // Get the raw text
    const text = await request.text();
    let body: any = {};
    
    if (text && text.trim()) {
      // Check if it's multipart form data
      if (text.includes('Content-Disposition')) {
        // Extract the _payload field from multipart form data
        const payloadMatch = text.match(/name="_payload"\r?\n\r?\n([\s\S]*?)\r?\n--/);
        if (payloadMatch && payloadMatch[1]) {
          try {
            body = JSON.parse(payloadMatch[1]);
          } catch (e) {
            console.error('Failed to parse _payload:', payloadMatch[1]);
            return NextResponse.json(
              { error: 'Invalid JSON in _payload field' },
              { status: 400 }
            );
          }
        }
      } else {
        // Try parsing as JSON
        try {
          body = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON body:', text);
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }
      }
    }

    // Create new park status
    console.log('Creating park status with data:', body);
    const result = await payload.create({
      collection: 'park-status' as any,
      data: body,
    });

    console.log('Park status created:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating park status:', error);
    return NextResponse.json(
      { error: 'Failed to create park status', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    
    // Get the raw text
    const text = await request.text();
    let body: any = {};
    
    if (text && text.trim()) {
      // Check if it's multipart form data
      if (text.includes('Content-Disposition')) {
        // Extract the _payload field from multipart form data
        const payloadMatch = text.match(/name="_payload"\r?\n\r?\n([\s\S]*?)\r?\n--/);
        if (payloadMatch && payloadMatch[1]) {
          try {
            body = JSON.parse(payloadMatch[1]);
          } catch (e) {
            console.error('Failed to parse _payload:', payloadMatch[1]);
            return NextResponse.json(
              { error: 'Invalid JSON in _payload field' },
              { status: 400 }
            );
          }
        }
      } else {
        // Try parsing as JSON
        try {
          body = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON body:', text);
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }
      }
    }
    
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Update park status
    console.log('Updating park status with id:', id, 'and data:', data);
    const result = await payload.update({
      collection: 'park-status' as any,
      id,
      data,
    });

    console.log('Park status updated:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating park status:', error);
    return NextResponse.json(
      { error: 'Failed to update park status', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Delete park status
    await payload.delete({
      collection: 'park-status' as any,
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting park status:', error);
    return NextResponse.json(
      { error: 'Failed to delete park status' },
      { status: 500 }
    );
  }
}

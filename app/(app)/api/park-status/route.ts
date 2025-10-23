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

    if (result.docs.length === 0) {
      // Return default closed status if no active status found
      return NextResponse.json({
        status: 'closed',
        message: null,
        updatedAt: new Date().toISOString(),
      });
    }

    const parkStatus = result.docs[0] as ParkStatusType;
    
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
    const body = await request.json();

    // Create new park status
    const result = await payload.create({
      collection: 'park-status' as any,
      data: body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating park status:', error);
    return NextResponse.json(
      { error: 'Failed to create park status' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Update park status
    const result = await payload.update({
      collection: 'park-status' as any,
      id,
      data,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating park status:', error);
    return NextResponse.json(
      { error: 'Failed to update park status' },
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

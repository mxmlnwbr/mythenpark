import { NextResponse } from 'next/server';
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

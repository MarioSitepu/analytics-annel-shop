import { NextRequest, NextResponse } from 'next/server';
import { getSalesUploadHistory, deleteSalesUploadHistory } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const type = searchParams.get('type'); // 'offline' or 'online'

    const histories = await getSalesUploadHistory();
    
    // Filter by storeId if provided
    let filteredHistories = histories;
    if (storeId) {
      filteredHistories = histories.filter(h => h.storeId === storeId);
    }

    // Sort by timestamp descending (newest first)
    filteredHistories.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ success: true, data: filteredHistories });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch upload history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await deleteSalesUploadHistory(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete upload history' }, { status: 500 });
  }
}


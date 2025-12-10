import { NextRequest, NextResponse } from 'next/server';
import { getProductTransfers, getProductAdditions } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date parameter is required' }, { status: 400 });
    }

    const transfers = await getProductTransfers();
    const additions = await getProductAdditions();

    // Filter by date
    const filteredTransfers = transfers.filter(t => {
      const transferDate = new Date(t.timestamp).toISOString().split('T')[0];
      return transferDate === date;
    });

    const filteredAdditions = additions.filter(a => {
      const additionDate = new Date(a.timestamp).toISOString().split('T')[0];
      return additionDate === date;
    });

    return NextResponse.json({
      success: true,
      data: {
        transfers: filteredTransfers,
        additions: filteredAdditions,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}


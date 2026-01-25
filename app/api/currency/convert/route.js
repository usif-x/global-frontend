import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const amount = searchParams.get('amount');

  if (!from || !to || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters: from, to, amount' },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `https://api.exconvert.com/convert?from=${from}&to=${to}&amount=${amount}&access_key=d15f54fb-d4ddfdfa-12c9faec-24b5f7e0`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Currency conversion API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency conversion' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { rating, comment, spread, improvementAreas } = await req.json();

    const token  = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!token || !baseId) {
      return NextResponse.json({ error: 'Airtable not configured' }, { status: 500 });
    }

    const res = await fetch(`https://api.airtable.com/v0/${baseId}/Feedback`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Rating:               rating,
              Comment:              comment           || '',
              Spread:               spread            || '',
              'Improvement Areas':  improvementAreas  || '',
              'Submitted At':       new Date().toISOString(),
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Airtable error:', err);
      return NextResponse.json({ error: 'Airtable write failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Feedback route error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

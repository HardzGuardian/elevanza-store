import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      updateEnabled: false, // don't overwrite existing contacts
    }),
  });

  // 201 = created, 204 = already exists — both are success from the user's perspective
  if (res.status === 201 || res.status === 204) {
    return NextResponse.json({ success: true });
  }

  // Brevo returns 400 with "Contact already exist" — treat as success
  const data = await res.json().catch(() => ({}));
  if (res.status === 400 && data?.message?.toLowerCase().includes('already exist')) {
    return NextResponse.json({ success: true });
  }

  console.error('Brevo subscribe error:', res.status, data);
  return NextResponse.json({ error: 'Failed to subscribe' }, { status: 502 });
}

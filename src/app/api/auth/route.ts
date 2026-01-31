import { NextResponse } from 'next/server';

// Dashboard password - set via environment variable
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'moltbot2026';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === DASHBOARD_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Set auth cookie (expires in 7 days)
      response.cookies.set('dashboard_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('dashboard_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

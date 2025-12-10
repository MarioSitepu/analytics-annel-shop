import { NextRequest, NextResponse } from 'next/server';

// Simple authentication - in production, use proper authentication with hashed passwords
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin' },
  { username: 'annel', password: 'beauty123' },
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    const user = VALID_CREDENTIALS.find(
      (cred) => cred.username === username && cred.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { username: user.username },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}


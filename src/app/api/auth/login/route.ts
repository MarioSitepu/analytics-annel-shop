import { NextRequest, NextResponse } from 'next/server';
import { loginSchema, getUserByUsername, verifyPassword } from '@/lib/auth';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiting setup (optional - only if UPSTASH_REDIS_REST_URL is set)
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
    analytics: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      const { success, limit, remaining } = await ratelimit.limit(ip);
      
      if (!success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' 
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
            }
          }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0]?.message || 'Username dan password harus diisi' 
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // Get user from database
    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Create response with HTTPOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: { username: user.username, id: user.id },
    });

    // Set HTTPOnly cookie for session (simple implementation)
    // In production, consider using NextAuth.js for full session management
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password harus diisi' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { username } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    if (user.status === 'banned') {
      return NextResponse.json({ error: 'Akun Anda telah dibanned' }, { status: 403 });
    }

    // Create a simple token (base64 encoded JSON)
    const tokenPayload = { id: user.id, username: user.username, role: user.role };
    const token = btoa(JSON.stringify(tokenPayload));

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

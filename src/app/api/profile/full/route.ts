import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - get full profile including password (authenticated - own account or admin)
export async function GET(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    // Allow user to view own full profile, or admin to view any user's full profile
    if (tokenUser.id !== userId && tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - hanya bisa melihat akun sendiri' }, { status: 403 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Return full user data including password (for account detail display)
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get full profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

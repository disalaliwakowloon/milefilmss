import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - change user role (admin only)
// Body: { role: 'admin' | 'user' }
// Prevent admin from demoting own role
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ error: 'Role tidak valid. Harus "admin" atau "user".' }, { status: 400 });
    }

    // Prevent admin from demoting own role
    if (tokenUser.id === id) {
      return NextResponse.json({ error: 'Anda tidak dapat mengubah role akun Anda sendiri.' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return NextResponse.json({ message: `Role ${updated.username} berhasil diubah menjadi ${role}`, user: updated });
  } catch (error) {
    console.error('Change role error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

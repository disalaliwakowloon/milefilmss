import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - change own password (authenticated)
// Body: { oldPassword, newPassword }
export async function POST(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Kata sandi lama dan baru wajib diisi' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Kata sandi baru minimal 6 karakter' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: tokenUser.id } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Verify old password matches
    if (user.password !== oldPassword) {
      return NextResponse.json({ error: 'Kata sandi lama tidak sesuai' }, { status: 400 });
    }

    if (oldPassword === newPassword) {
      return NextResponse.json({ error: 'Kata sandi baru tidak boleh sama dengan kata sandi lama' }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });

    return NextResponse.json({ message: 'Kata sandi berhasil diubah!' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

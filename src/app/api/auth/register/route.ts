import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode, username, email, phone, password, confirmPassword, role } = body;

    // Validate required fields
    if (!username || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    // Check if request is from admin (admin registration bypasses invite code)
    const tokenUser = getUserFromToken(request);
    const isAdmin = tokenUser && tokenUser.role === 'admin';

    // Determine final role: only admin can create admin accounts; otherwise always 'user'
    const finalRole = isAdmin && role === 'admin' ? 'admin' : 'user';

    if (!isAdmin) {
      // For regular users: invite code is required
      if (!inviteCode || inviteCode.trim() === '') {
        return NextResponse.json({ error: 'Kode undangan wajib diisi' }, { status: 400 });
      }

      // Validate invite code against active code in DB
      const setting = await db.appSetting.findUnique({ where: { key: 'activeInviteCode' } });
      if (!setting) {
        return NextResponse.json({ error: 'Kode undangan belum tersedia. Hubungi admin.' }, { status: 400 });
      }
      const parts = setting.value.split('|');
      const activeCode = parts[0] || '';
      const isActive = parts[1] === 'true';
      if (!isActive || !activeCode) {
        return NextResponse.json({ error: 'Kode undangan belum aktif. Hubungi admin.' }, { status: 400 });
      }
      if (inviteCode.trim() !== activeCode.trim()) {
        return NextResponse.json({ error: 'Kode undangan tidak valid. Silakan periksa kembali.' }, { status: 400 });
      }
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password dan konfirmasi password tidak cocok' }, { status: 400 });
    }

    // Check unique username
    const existingUsername = await db.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }

    // Check unique email
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
    }

    // Create user
    const user = await db.user.create({
      data: {
        username,
        email,
        phone,
        password,
        inviteCode: inviteCode ? inviteCode.trim() : '',
        role: finalRole,
        status: 'active',
        balance: 0,
      },
    });

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

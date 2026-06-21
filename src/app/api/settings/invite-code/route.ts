import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - get the current active invite code (public, no auth needed for users to check)
export async function GET() {
  try {
    const setting = await db.appSetting.findUnique({
      where: { key: 'activeInviteCode' },
    });

    if (!setting) {
      return NextResponse.json({ code: '', isActive: false });
    }

    // value format: "code|true" or "code|false" or just "code"
    const parts = setting.value.split('|');
    const code = parts[0] || '';
    const isActive = parts[1] === 'true';

    return NextResponse.json({ code, isActive });
  } catch (error) {
    console.error('Get invite code error:', error);
    return NextResponse.json({ code: '', isActive: false });
  }
}

// PUT - set the active invite code (admin only)
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { code, isActive } = body;

    if (typeof code !== 'string') {
      return NextResponse.json({ error: 'Kode harus berupa teks' }, { status: 400 });
    }

    const value = `${code}|${isActive ? 'true' : 'false'}`;

    await db.appSetting.upsert({
      where: { key: 'activeInviteCode' },
      update: { value },
      create: { key: 'activeInviteCode', value },
    });

    return NextResponse.json({ code, isActive, message: isActive ? 'Kode undangan diaktifkan' : 'Kode undangan dinonaktifkan' });
  } catch (error) {
    console.error('Set invite code error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - get customer service link (public)
export async function GET() {
  try {
    const setting = await db.appSetting.findUnique({ where: { key: 'csLink' } });
    return NextResponse.json({ link: setting?.value || '' });
  } catch (error) {
    console.error('Get CS link error:', error);
    return NextResponse.json({ link: '' });
  }
}

// PUT - save customer service link (admin only)
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { link } = body;

    if (link === undefined) {
      return NextResponse.json({ error: 'link diperlukan' }, { status: 400 });
    }

    await db.appSetting.upsert({
      where: { key: 'csLink' },
      update: { value: link },
      create: { key: 'csLink', value: link },
    });

    return NextResponse.json({ message: 'Link customer service berhasil disimpan!', link });
  } catch (error) {
    console.error('Save CS link error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - get wallpaper URL (public)
export async function GET() {
  try {
    const setting = await db.appSetting.findUnique({ where: { key: 'wallpaperUrl' } });
    return NextResponse.json({ wallpaperUrl: setting?.value || '' });
  } catch (error) {
    console.error('Get wallpaper error:', error);
    return NextResponse.json({ wallpaperUrl: '' });
  }
}

// PUT - save wallpaper URL (admin only)
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { wallpaperUrl } = body;

    if (wallpaperUrl === undefined) {
      return NextResponse.json({ error: 'wallpaperUrl diperlukan' }, { status: 400 });
    }

    await db.appSetting.upsert({
      where: { key: 'wallpaperUrl' },
      update: { value: wallpaperUrl },
      create: { key: 'wallpaperUrl', value: wallpaperUrl },
    });

    return NextResponse.json({ message: 'Wallpaper berhasil disimpan!', wallpaperUrl });
  } catch (error) {
    console.error('Save wallpaper error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE - clear wallpaper (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    await db.appSetting.deleteMany({ where: { key: 'wallpaperUrl' } });
    return NextResponse.json({ message: 'Wallpaper berhasil dihapus!' });
  } catch (error) {
    console.error('Delete wallpaper error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

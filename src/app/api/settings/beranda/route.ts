import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - get beranda settings (public)
export async function GET() {
  try {
    const trailerVideoSetting = await db.appSetting.findUnique({ where: { key: 'trailerVideoUrl' } });
    const trailerLinkSetting = await db.appSetting.findUnique({ where: { key: 'trailerLink' } });
    const trailerTitleSetting = await db.appSetting.findUnique({ where: { key: 'trailerTitle' } });
    const trailerImageSetting = await db.appSetting.findUnique({ where: { key: 'trailerImage' } });
    const logoSetting = await db.appSetting.findUnique({ where: { key: 'logoUrl' } });
    const trailerVideoUrl = trailerVideoSetting?.value || '';
    const trailerLink = trailerLinkSetting?.value || '';
    const trailerTitle = trailerTitleSetting?.value || '';
    const trailerImage = trailerImageSetting?.value || '';
    const logoUrl = logoSetting?.value || '';
    return NextResponse.json({ trailerVideoUrl, trailerLink, trailerTitle, trailerImage, logoUrl });
  } catch (error) {
    console.error('Get beranda settings error:', error);
    return NextResponse.json({ trailerVideoUrl: '', trailerLink: '', trailerTitle: '', trailerImage: '', logoUrl: '' });
  }
}

// PUT - save beranda settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();

    if (body.trailerVideoUrl !== undefined) {
      await db.appSetting.upsert({
        where: { key: 'trailerVideoUrl' },
        update: { value: body.trailerVideoUrl },
        create: { key: 'trailerVideoUrl', value: body.trailerVideoUrl },
      });
    }

    if (body.trailerLink !== undefined) {
      await db.appSetting.upsert({
        where: { key: 'trailerLink' },
        update: { value: body.trailerLink },
        create: { key: 'trailerLink', value: body.trailerLink },
      });
    }

    if (body.trailerTitle !== undefined) {
      await db.appSetting.upsert({
        where: { key: 'trailerTitle' },
        update: { value: body.trailerTitle },
        create: { key: 'trailerTitle', value: body.trailerTitle },
      });
    }

    if (body.trailerImage !== undefined) {
      await db.appSetting.upsert({
        where: { key: 'trailerImage' },
        update: { value: body.trailerImage },
        create: { key: 'trailerImage', value: body.trailerImage },
      });
    }

    if (body.logoUrl !== undefined) {
      await db.appSetting.upsert({
        where: { key: 'logoUrl' },
        update: { value: body.logoUrl },
        create: { key: 'logoUrl', value: body.logoUrl },
      });
    }

    return NextResponse.json({ message: 'Pengaturan beranda berhasil disimpan!' });
  } catch (error) {
    console.error('Save beranda settings error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

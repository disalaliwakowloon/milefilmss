import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - get all bank destination accounts (public, users need to see these)
export async function GET() {
  try {
    const settings = await db.appSetting.findMany({
      where: { key: { startsWith: 'bankDest_' } },
      orderBy: { updatedAt: 'desc' },
    });

    const banks = settings.map(s => {
      try {
        return JSON.parse(s.value);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ banks });
  } catch (error) {
    console.error('Get bank destinations error:', error);
    return NextResponse.json({ banks: [] });
  }
}

// PUT - save a bank destination account (admin only)
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, bankName, accountNumber, bankType } = body;

    if (!bankName || !accountNumber || !bankType) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    const settingId = id || `bankDest_${Date.now()}`;
    const value = JSON.stringify({ id: settingId, bankName, accountNumber, bankType });

    await db.appSetting.upsert({
      where: { key: settingId },
      update: { value },
      create: { key: settingId, value },
    });

    return NextResponse.json({ id: settingId, bankName, accountNumber, bankType, message: 'Bank tujuan berhasil disimpan!' });
  } catch (error) {
    console.error('Save bank destination error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE - remove a bank destination account (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    await db.appSetting.delete({ where: { key: id } });

    return NextResponse.json({ message: 'Bank tujuan berhasil dihapus!' });
  } catch (error) {
    console.error('Delete bank destination error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

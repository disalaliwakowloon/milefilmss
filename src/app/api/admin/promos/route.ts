import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - create new promo (admin only)
// Body: { img, link }
export async function POST(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { img, link } = body;

    if (!img) {
      return NextResponse.json({ error: 'img diperlukan' }, { status: 400 });
    }

    const promo = await db.promo.create({
      data: {
        img,
        link: typeof link === 'string' ? link : '#',
      },
    });

    return NextResponse.json({ message: 'Promo berhasil ditambahkan!', promo }, { status: 201 });
  } catch (error) {
    console.error('Create promo error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// PUT - update promo (admin only)
// Body: { id, img?, link? }
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, img, link } = body;

    if (!id) {
      return NextResponse.json({ error: 'id diperlukan' }, { status: 400 });
    }

    const existing = await db.promo.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: 'Promo tidak ditemukan' }, { status: 404 });
    }

    const updateData: { img?: string; link?: string } = {};
    if (img !== undefined) updateData.img = img;
    if (link !== undefined) updateData.link = link;

    const updated = await db.promo.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({ message: 'Promo berhasil diperbarui!', promo: updated });
  } catch (error) {
    console.error('Update promo error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE - delete promo by id query param (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    if (!idParam) {
      return NextResponse.json({ error: 'id diperlukan' }, { status: 400 });
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'id tidak valid' }, { status: 400 });
    }

    const existing = await db.promo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Promo tidak ditemukan' }, { status: 404 });
    }

    await db.promo.delete({ where: { id } });
    return NextResponse.json({ message: 'Promo berhasil dihapus!' });
  } catch (error) {
    console.error('Delete promo error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

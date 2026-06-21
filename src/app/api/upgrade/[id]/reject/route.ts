import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

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
    const { adminId } = body;

    if (!adminId) {
      return NextResponse.json({ error: 'adminId diperlukan' }, { status: 400 });
    }

    const upgradeRequest = await db.upgradeRequest.findUnique({ where: { id } });
    if (!upgradeRequest) {
      return NextResponse.json({ error: 'Request tidak ditemukan' }, { status: 404 });
    }

    if (upgradeRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request sudah diproses' }, { status: 400 });
    }

    // Update request status
    await db.upgradeRequest.update({
      where: { id },
      data: { status: 'rejected', reviewedAt: new Date() },
    });

    return NextResponse.json({ message: 'Request rejected successfully' });
  } catch (error) {
    console.error('Reject upgrade error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - auto-complete upgrade request (authenticated)
// Auto-approves the upgrade, adds amount to user balance, creates credit transaction
// Body: { requestId }
export async function POST(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'requestId diperlukan' }, { status: 400 });
    }

    const upgradeRequest = await db.upgradeRequest.findUnique({ where: { id: requestId } });
    if (!upgradeRequest) {
      return NextResponse.json({ error: 'Permintaan tidak ditemukan' }, { status: 404 });
    }

    // Only the owner can auto-complete their own request
    if (upgradeRequest.userId !== tokenUser.id) {
      return NextResponse.json({ error: 'Forbidden - bukan pemilik permintaan' }, { status: 403 });
    }

    // Only pending requests can be auto-completed
    if (upgradeRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Permintaan sudah diproses' }, { status: 400 });
    }

    // Use transaction to ensure atomicity
    await db.$transaction([
      db.upgradeRequest.update({
        where: { id: requestId },
        data: { status: 'approved', reviewedAt: new Date() },
      }),
      db.user.update({
        where: { id: upgradeRequest.userId },
        data: { balance: { increment: upgradeRequest.amount } },
      }),
      db.transaction.create({
        data: {
          userId: upgradeRequest.userId,
          type: 'credit',
          amount: upgradeRequest.amount,
          description: `Upgrade approved: ${upgradeRequest.action}`,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Permintaan peningkatan berhasil diselesaikan otomatis!',
      amount: upgradeRequest.amount,
    });
  } catch (error) {
    console.error('Auto-complete upgrade error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

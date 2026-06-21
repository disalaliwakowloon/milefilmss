import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId, action, amount } = body;

    if (!userId || !eventId || !action || !amount) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    const upgradeRequest = await db.upgradeRequest.create({
      data: {
        userId,
        eventId,
        action,
        amount: parseFloat(amount),
        status: 'pending',
      },
    });

    return NextResponse.json({ upgradeRequest }, { status: 201 });
  } catch (error) {
    console.error('Create upgrade request error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (tokenUser.role === 'admin') {
      // Admin: return all pending upgrade requests with user info
      const requests = await db.upgradeRequest.findMany({
        where: { status: 'pending' },
        include: { user: { select: { id: true, username: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ requests });
    } else {
      // Regular user: return only their own requests
      const requests = await db.upgradeRequest.findMany({
        where: { userId: tokenUser.id },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ requests });
    }
  } catch (error) {
    console.error('Get upgrade requests error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

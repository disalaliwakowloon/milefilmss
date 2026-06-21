import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const whereClause: Record<string, unknown> = {};
    if (search) {
      whereClause.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const total = await db.user.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit);

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        balance: true,
        role: true,
        status: true,
        inviteCode: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
        withdrawAccounts: {
          select: {
            id: true,
            cardType: true,
            bankOwner: true,
            bankName: true,
            accountNumber: true,
            phone: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ users, total, page, totalPages });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

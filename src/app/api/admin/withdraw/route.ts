import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { username, amount } = await request.json();
    if (!username || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Username dan nominal harus valid' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    if (user.balance < amount) {
      return NextResponse.json({
        error: `Saldo @${username} tidak mencukupi. Saldo saat ini: Rp ${user.balance.toLocaleString('id-ID')}`,
      }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { balance: { decrement: amount } },
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'debit',
        amount: amount,
        description: `Admin withdraw: -Rp ${amount.toLocaleString('id-ID')}`,
      },
    });

    return NextResponse.json({
      message: `Withdraw berhasil. Saldo @${username}: Rp ${updatedUser.balance.toLocaleString('id-ID')}`,
      newBalance: updatedUser.balance,
    });
  } catch (error) {
    console.error('Admin withdraw error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);

    // Validate minimum amount
    if (parsedAmount < 10000) {
      return NextResponse.json({ error: 'Minimum penarikan adalah Rp 10.000' }, { status: 400 });
    }

    // Get user
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Validate balance
    if (parsedAmount > user.balance) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 });
    }

    // Deduct from user balance
    await db.user.update({
      where: { id: userId },
      data: { balance: { decrement: parsedAmount } },
    });

    // Create debit transaction
    await db.transaction.create({
      data: {
        userId,
        type: 'debit',
        amount: parsedAmount,
        description: 'Penarikan saldo',
      },
    });

    return NextResponse.json({ message: 'Penarikan berhasil' });
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

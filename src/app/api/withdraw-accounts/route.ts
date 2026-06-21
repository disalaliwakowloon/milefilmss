import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    const accounts = await db.withdrawAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Get withdraw accounts error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cardType, bankOwner, phone, bankName, accountNumber } = body;

    if (!userId || !cardType || !bankOwner || !phone || !bankName || !accountNumber) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    // Check user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Check accountNumber uniqueness
    const existingAccount = await db.withdrawAccount.findFirst({
      where: { accountNumber, NOT: { userId } },
    });
    if (existingAccount) {
      return NextResponse.json({ error: 'Nomor rekening sudah digunakan' }, { status: 400 });
    }

    // Check phone uniqueness
    const existingPhone = await db.withdrawAccount.findFirst({
      where: { phone, NOT: { userId } },
    });
    if (existingPhone) {
      return NextResponse.json({ error: 'Nomor telepon sudah digunakan' }, { status: 400 });
    }

    // Check bankOwner uniqueness
    const existingOwner = await db.withdrawAccount.findFirst({
      where: { bankOwner, NOT: { userId } },
    });
    if (existingOwner) {
      return NextResponse.json({ error: 'Nama pemilik rekening sudah digunakan' }, { status: 400 });
    }

    const account = await db.withdrawAccount.create({
      data: {
        userId,
        cardType,
        bankOwner,
        phone,
        bankName,
        accountNumber,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Create withdraw account error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

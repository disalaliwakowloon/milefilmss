import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
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
    const { cardType, bankOwner, bankName, accountNumber, phone } = body;

    const account = await db.withdrawAccount.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ error: 'Akun penarikan tidak ditemukan' }, { status: 404 });
    }

    const updateData: Record<string, string> = {};
    if (cardType !== undefined) updateData.cardType = cardType;
    if (bankOwner !== undefined) updateData.bankOwner = bankOwner;
    if (bankName !== undefined) updateData.bankName = bankName;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (phone !== undefined) updateData.phone = phone;

    const updatedAccount = await db.withdrawAccount.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Update withdraw account error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id } = await params;

    const account = await db.withdrawAccount.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ error: 'Akun penarikan tidak ditemukan' }, { status: 404 });
    }

    await db.withdrawAccount.delete({ where: { id } });
    return NextResponse.json({ message: 'Akun penarikan berhasil dihapus' });
  } catch (error) {
    console.error('Delete withdraw account error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

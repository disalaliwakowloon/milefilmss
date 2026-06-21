import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        balance: true,
        role: true,
        status: true,
        withdrawPassword: true,
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
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

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
    const { password, email, phone, withdrawPassword, username } = body;

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const updateData: Record<string, string> = {};
    if (password !== undefined && password !== '') updateData.password = password;
    if (withdrawPassword !== undefined && withdrawPassword !== '') updateData.withdrawPassword = withdrawPassword;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    // Check username uniqueness if changing
    if (username !== undefined && username !== '') {
      const existingUsername = await db.user.findFirst({ where: { username, NOT: { id } } });
      if (existingUsername) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
      }
      updateData.username = username;
    }

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existingEmail = await db.user.findFirst({ where: { email, NOT: { id } } });
      if (existingEmail) {
        return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, withdrawPassword: __, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update user error:', error);
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

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Delete related data first
    await db.upgradeRequest.deleteMany({ where: { userId: id } });
    await db.transaction.deleteMany({ where: { userId: id } });
    await db.withdrawAccount.deleteMany({ where: { userId: id } });
    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

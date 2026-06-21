import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const promos = await db.promo.findMany();
    return NextResponse.json({ promos });
  } catch (error) {
    console.error('Get promos error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const movies = await db.movie.findMany();
    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Get movies error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

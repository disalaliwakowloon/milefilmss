import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// PUT - update a movie's data (admin only) - supports title, genre, rating, link
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, genre, rating, link, img } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID film diperlukan' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (title !== undefined) updateData.title = title;
    if (genre !== undefined) updateData.genre = genre;
    if (rating !== undefined) updateData.rating = rating;
    if (link !== undefined) updateData.link = link;
    if (img !== undefined) updateData.img = img;

    const movie = await db.movie.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json({ movie, message: 'Film berhasil diperbarui!' });
  } catch (error) {
    console.error('Update movie error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST - add a new movie (admin only)
export async function POST(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { title, genre, img, rating, link } = body;

    if (!title || !genre) {
      return NextResponse.json({ error: 'Title dan genre wajib diisi' }, { status: 400 });
    }

    const movie = await db.movie.create({
      data: {
        title,
        genre,
        img: img || `movie_${Date.now()}`,
        rating: rating || '9.0',
        link: link || '',
        type: 'popular',
      },
    });

    return NextResponse.json({ movie, message: 'Film berhasil ditambahkan!' });
  } catch (error) {
    console.error('Add movie error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE - delete a movie (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    await db.movie.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'Film berhasil dihapus!' });
  } catch (error) {
    console.error('Delete movie error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

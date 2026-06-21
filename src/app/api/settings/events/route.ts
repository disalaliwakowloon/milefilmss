import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - get all event banner settings (public)
// Returns { eventSettings: Record<string, {img?, aktivasi?}> }
export async function GET() {
  try {
    const settings = await db.appSetting.findMany({
      where: {
        OR: [
          { key: { startsWith: 'event_' } },
        ],
      },
    });

    const eventSettings: Record<string, { img?: string; aktivasi?: string }> = {};

    for (const s of settings) {
      // keys are like: event_<eventId>_img or event_<eventId>_aktivasi
      if (s.key.startsWith('event_')) {
        const rest = s.key.slice('event_'.length); // <eventId>_img | <eventId>_aktivasi
        const lastUnderscore = rest.lastIndexOf('_');
        if (lastUnderscore > 0) {
          const eventId = rest.slice(0, lastUnderscore);
          const field = rest.slice(lastUnderscore + 1); // img | aktivasi
          if (field === 'img' || field === 'aktivasi') {
            if (!eventSettings[eventId]) eventSettings[eventId] = {};
            eventSettings[eventId][field] = s.value;
          }
        }
      }
    }

    return NextResponse.json({ eventSettings });
  } catch (error) {
    console.error('Get event settings error:', error);
    return NextResponse.json({ eventSettings: {} });
  }
}

// PUT - save event banner settings (admin only)
// Body: { eventId, img?, aktivasi? }
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { eventId, img, aktivasi } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId diperlukan' }, { status: 400 });
    }

    if (typeof img === 'string' && img.trim() !== '') {
      await db.appSetting.upsert({
        where: { key: `event_${eventId}_img` },
        update: { value: img },
        create: { key: `event_${eventId}_img`, value: img },
      });
    } else if (img === '') {
      // explicitly clear
      await db.appSetting.deleteMany({ where: { key: `event_${eventId}_img` } });
    }

    if (typeof aktivasi === 'string' && aktivasi.trim() !== '') {
      await db.appSetting.upsert({
        where: { key: `event_${eventId}_aktivasi` },
        update: { value: aktivasi },
        create: { key: `event_${eventId}_aktivasi`, value: aktivasi },
      });
    } else if (aktivasi === '') {
      await db.appSetting.deleteMany({ where: { key: `event_${eventId}_aktivasi` } });
    }

    return NextResponse.json({ message: 'Pengaturan event berhasil disimpan!' });
  } catch (error) {
    console.error('Save event settings error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

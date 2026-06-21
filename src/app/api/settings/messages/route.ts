import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface AdminMessage {
  id: number;
  text: string;
  createdAt: string;
}

// GET - get all admin messages (public)
export async function GET() {
  try {
    const setting = await db.appSetting.findUnique({ where: { key: 'adminMessages' } });
    let messages: AdminMessage[] = [];
    if (setting?.value) {
      try {
        messages = JSON.parse(setting.value);
      } catch {
        messages = [];
      }
    }
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ messages: [] });
  }
}

// PUT - replace all admin messages (admin only)
export async function PUT(request: NextRequest) {
  try {
    const tokenUser = getUserFromToken(request);
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages harus berupa array' }, { status: 400 });
    }

    // Sanitize: ensure each message has id, text, createdAt
    const sanitized: AdminMessage[] = messages.map((m: { id?: number; text?: string; createdAt?: string }, idx: number) => ({
      id: typeof m.id === 'number' ? m.id : Date.now() + idx,
      text: typeof m.text === 'string' ? m.text : String(m.text ?? ''),
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date().toISOString(),
    }));

    await db.appSetting.upsert({
      where: { key: 'adminMessages' },
      update: { value: JSON.stringify(sanitized) },
      create: { key: 'adminMessages', value: JSON.stringify(sanitized) },
    });

    return NextResponse.json({ message: 'Pesan berhasil disimpan!', messages: sanitized });
  } catch (error) {
    console.error('Save messages error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

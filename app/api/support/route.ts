import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

async function getSessionUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listThreads = searchParams.get('threads');
    
    if (listThreads === 'true') {
      // Find all unique userIds who have support messages
      const threads = await prisma.supportMessage.groupBy({
        by: ['userId'],
      });
      
      // Fetch user details and last message for each thread
      const threadDetails = await Promise.all(
        threads.map(async (t) => {
          const user = await prisma.user.findUnique({
            where: { id: t.userId },
            select: { id: true, name: true, email: true },
          });
          const lastMsg = await prisma.supportMessage.findFirst({
            where: { userId: t.userId },
            orderBy: { createdAt: 'desc' },
          });
          return {
            userId: t.userId,
            userName: user?.name || 'Unknown Student',
            userEmail: user?.email || '',
            lastMessage: lastMsg?.text || '',
            lastMessageAt: lastMsg?.createdAt || new Date(),
          };
        })
      );
      
      // Sort threads by last message timestamp desc
      threadDetails.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      return NextResponse.json({ threads: threadDetails });
    }

    let userId = searchParams.get('userId');
    if (!userId) {
      userId = (await getSessionUserId()) || null;
    }
    
    if (!userId) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let { userId, text, sender } = body;

    if (!userId) {
      userId = await getSessionUserId();
    }

    if (!userId) {
      return NextResponse.json({ error: 'User session not found' }, { status: 401 });
    }

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message text cannot be empty' }, { status: 400 });
    }

    const message = await prisma.supportMessage.create({
      data: {
        userId,
        sender: sender || 'STUDENT',
        text: text.trim(),
      },
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

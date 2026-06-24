import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (eventId && eventId !== 'All') {
      where.eventId = eventId;
    }

    if (search && search.trim() !== '') {
      const query = search.trim();
      where.user = {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      };
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            department: true,
            certificates: {
              select: {
                id: true,
                title: true,
                issueDate: true,
              }
            }
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
            time: true,
            location: true,
            venue: true,
            amount: true,
            isFree: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    return NextResponse.json({ registrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ events: [], users: [], teams: [] });
    }

    // Search events
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } },
          { location: { contains: q } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        date: true,
        location: true,
        imageUrl: true,
      },
    });

    // Search users (students)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { department: { contains: q } },
          { email: { contains: q } },
        ],
      },
      take: 4,
      select: {
        id: true,
        name: true,
        department: true,
        email: true,
      },
    });

    // Search teams (via event title or team name)
    const teamEvents = await prisma.event.findMany({
      where: {
        teams: {
          some: {
            name: { contains: q },
          },
        },
      },
      include: {
        teams: {
          where: { name: { contains: q } },
          take: 3,
          select: {
            id: true,
            name: true,
            openPositions: true,
          },
        },
      },
      take: 3,
    });

    const teams = teamEvents.flatMap(e =>
      e.teams.map(t => ({
        id: t.id,
        name: t.name,
        eventTitle: e.title,
        openPositions: t.openPositions,
      }))
    ).slice(0, 4);

    return NextResponse.json({ events, users, teams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'alex-chen-id';

    // Query all users ordered by points descending
    const users = await prisma.user.findMany({
      orderBy: {
        points: 'desc',
      },
      include: {
        skills: true,
        _count: {
          select: {
            badges: true,
            registrations: {
              where: {
                NOT: {
                  attendedAt: null,
                },
              },
            },
          },
        },
      },
    });

    // Format results
    const topStudents = users.map((u, index) => {
      const skillScore = u.skills.reduce((sum, s) => sum + s.level, 0);
      return {
        rank: index + 1,
        name: u.name,
        dept: u.department || 'Undeclared',
        points: u.points,
        badges: u._count.badges,
        events: u._count.registrations,
        skillScore,
        skillCount: u.skills.length,
        avatar: u.avatarUrl || u.name.substring(0, 2).toUpperCase(),
        isCurrentUser: u.id === userId,
      };
    });

    return NextResponse.json({ topStudents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

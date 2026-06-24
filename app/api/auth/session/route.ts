import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      // Return null user to indicate no active session
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      // Cookie is invalid or user was deleted
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

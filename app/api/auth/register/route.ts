import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        department: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email } = data;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (!email || email.trim() === "") {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // 1. Check if user already exists by email
    let user = await prisma.user.findUnique({
      where: {
        email: trimmedEmail,
      },
    });

    if (user) {
      // User found. Log them in.
      return NextResponse.json({ user });
    }

    const initials = trimmedName.substring(0, 2).toUpperCase();

    // 3. Create new student record
    user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        name: trimmedName,
        role: 'STUDENT',
        avatarUrl: initials,
        bio: 'CampusConnect student member. Excited to explore upcoming events!',
        college: 'School of Engineering',
        department: 'Computer Science',
        graduationYear: '2027',
        points: 0,
        nationalRank: 120,
        collegeRank: 35,
      },
    });

    // Link starting skills
    const reactSkill = await prisma.skill.findUnique({ where: { name: 'React' } });
    const pythonSkill = await prisma.skill.findUnique({ where: { name: 'Python' } });
    
    if (reactSkill) {
      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: reactSkill.id,
          level: 50,
        },
      });
    }
    
    if (pythonSkill) {
      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: pythonSkill.id,
          level: 40,
        },
      });
    }

    // Log welcome activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        icon: 'waving_hand',
        color: 'var(--primary)',
        bgColor: 'rgba(0, 74, 198, 0.08)',
        text: `<strong>Welcome to CampusConnect!</strong> Your student profile has been created successfully.`,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


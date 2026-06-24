import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value || 'alex-chen-id';
}

export async function GET() {
  try {
    const userId = await getUserId();
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
        certificates: true,
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        registrations: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserId();
    const data = await req.json();
    const {
      name,
      bio,
      avatarUrl,
      department,
      graduationYear,
      linkedinUrl,
      githubUrl,
      theme,
      highContrast,
      accentColor,
      notifyReminds,
      notifyInvites,
      notifyMilestones,
      skills, // Array of skill names e.g. ["React", "Python"]
    } = data;

    // 1. Update basic user details
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        department: department !== undefined ? department : undefined,
        graduationYear: graduationYear !== undefined ? graduationYear : undefined,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : undefined,
        githubUrl: githubUrl !== undefined ? githubUrl : undefined,
        theme: theme !== undefined ? theme : undefined,
        highContrast: highContrast !== undefined ? highContrast : undefined,
        accentColor: accentColor !== undefined ? accentColor : undefined,
        notifyReminds: notifyReminds !== undefined ? notifyReminds : undefined,
        notifyInvites: notifyInvites !== undefined ? notifyInvites : undefined,
        notifyMilestones: notifyMilestones !== undefined ? notifyMilestones : undefined,
      },
    });

    // 2. If skills list is provided, sync user skills (upsert skill records)
    if (skills && Array.isArray(skills)) {
      // Upsert each skill by name — create if not found
      const skillRecords = await Promise.all(
        skills.map((skillName: string) =>
          prisma.skill.upsert({
            where: { name: skillName },
            update: {},
            create: {
              name: skillName,
              category: "GENERAL",
            },
          })
        )
      );

      // Clear current skills
      await prisma.userSkill.deleteMany({ where: { userId } });

      // Insert new skills with default level
      for (const skill of skillRecords) {
        await prisma.userSkill.create({
          data: {
            userId,
            skillId: skill.id,
            level: 70,
          },
        });
      }
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

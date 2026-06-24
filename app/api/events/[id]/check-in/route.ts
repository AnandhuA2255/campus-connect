import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { qrCodeString } = await req.json();
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'alex-chen-id';

    // 1. Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 2. Find registration matching QR code string
    const registration = await prisma.registration.findUnique({
      where: {
        qrCodeString: qrCodeString,
      },
      include: {
        user: true,
      }
    });

    if (!registration) {
      return NextResponse.json({ error: 'Invalid QR Code. No registration found.' }, { status: 404 });
    }

    if (registration.eventId !== eventId) {
      return NextResponse.json({ error: 'This QR Code belongs to a different event.' }, { status: 400 });
    }

    if (registration.attendedAt) {
      return NextResponse.json({ error: 'This ticket has already been checked in.' }, { status: 400 });
    }

    const studentId = registration.userId;

    // 3. Mark registration as checked in
    await prisma.registration.update({
      where: {
        id: registration.id,
      },
      data: {
        attendedAt: new Date(),
      },
    });

    // 4. Award points to student (+50 points)
    const updatedUser = await prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        points: {
          increment: 50,
        },
      },
    });

    // 5. Create activity log for the student check-in
    await prisma.activity.create({
      data: {
        userId: studentId,
        icon: 'task_alt',
        color: 'var(--secondary)',
        bgColor: 'rgba(108,248,187,0.15)',
        text: `<strong>Checked In:</strong> Verified attendance at <em>${event.title}</em> (+50 pts).`,
      },
    });

    // 6. Check for badge milestones — use studentId (the actual student), not userId (the scanner)
    const attendedCount = await prisma.registration.count({
      where: {
        userId: studentId,
        NOT: {
          attendedAt: null,
        },
      },
    });

    let badgeUnlocked = null;

    // Unlock "Volunteer" badge on first check-in
    if (attendedCount >= 1) {
      const volunteerBadge = await prisma.badge.findUnique({ where: { name: 'Volunteer' } });
      if (volunteerBadge) {
        const alreadyHas = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId: studentId, badgeId: volunteerBadge.id } },
        });
        if (!alreadyHas) {
          await prisma.userBadge.create({ data: { userId: studentId, badgeId: volunteerBadge.id } });
          badgeUnlocked = volunteerBadge;
          await prisma.activity.create({
            data: {
              userId: studentId,
              icon: 'military_tech',
              color: 'var(--secondary)',
              bgColor: 'rgba(108,248,187,0.15)',
              text: `<strong>Badge Unlocked:</strong> You earned the <strong>${volunteerBadge.name}</strong> badge for attending your first event!`,
            },
          });
        }
      }
    }

    // Unlock "Collaborator" badge after attending 2+ events
    if (attendedCount >= 2 && !badgeUnlocked) {
      const collaboratorBadge = await prisma.badge.findUnique({ where: { name: 'Collaborator' } });
      if (collaboratorBadge) {
        const alreadyHas = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId: studentId, badgeId: collaboratorBadge.id } },
        });
        if (!alreadyHas) {
          await prisma.userBadge.create({ data: { userId: studentId, badgeId: collaboratorBadge.id } });
          badgeUnlocked = collaboratorBadge;
          await prisma.activity.create({
            data: {
              userId: studentId,
              icon: 'workspace_premium',
              color: 'var(--tertiary)',
              bgColor: 'rgba(131,67,244,0.1)',
              text: `<strong>Badge Unlocked:</strong> You earned the <strong>${collaboratorBadge.name}</strong> badge!`,
            },
          });
        }
      }
    }

    // Unlock "Tech Enthusiast" badge after attending 5+ events
    if (attendedCount >= 5 && !badgeUnlocked) {
      const techBadge = await prisma.badge.findUnique({ where: { name: 'Tech Enthusiast' } });
      if (techBadge) {
        const alreadyHas = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId: studentId, badgeId: techBadge.id } },
        });
        if (!alreadyHas) {
          await prisma.userBadge.create({ data: { userId: studentId, badgeId: techBadge.id } });
          badgeUnlocked = techBadge;
          await prisma.activity.create({
            data: {
              userId: studentId,
              icon: 'rocket_launch',
              color: 'var(--primary)',
              bgColor: 'rgba(0,74,198,0.08)',
              text: `<strong>Badge Unlocked:</strong> You earned the <strong>${techBadge.name}</strong> badge for attending 5+ events!`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      pointsAwarded: 50,
      newPointsTotal: updatedUser.points,
      badgeUnlocked,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value || 'alex-chen-id';
}

// GET — fetch received invitations AND sent requests for the current user
export async function GET() {
  try {
    const userId = await getUserId();

    // Received invitations (someone invited me)
    const received = await prisma.teamInvitation.findMany({
      where: { toId: userId },
      include: { team: true, sender: true },
      orderBy: { createdAt: 'desc' },
    });

    // Sent join requests (I invited myself / requested to join)
    const sent = await prisma.teamInvitation.findMany({
      where: { fromId: userId, toId: { not: userId } },
      include: { team: true, recipient: true },
      orderBy: { createdAt: 'desc' },
    });

    const receivedFormatted = received.map((inv) => ({
      id: inv.id,
      type: 'received' as const,
      from: inv.sender.name,
      to: null,
      team: inv.team.name,
      teamId: inv.teamId,
      status: inv.status,
      time: 'Recently',
    }));

    const sentFormatted = sent.map((inv) => ({
      id: inv.id,
      type: 'sent' as const,
      from: null,
      to: inv.recipient.name,
      team: inv.team.name,
      teamId: inv.teamId,
      status: inv.status,
      time: 'Recently',
    }));

    return NextResponse.json({ invitations: [...receivedFormatted, ...sentFormatted] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — send a join request to a team
export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { isLead: true },
          include: { user: true },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is already a member
    const alreadyMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    if (alreadyMember) {
      return NextResponse.json({ error: 'You are already a member of this team' }, { status: 409 });
    }

    // Check for duplicate pending request
    const existing = await prisma.teamInvitation.findFirst({
      where: { teamId, fromId: userId, status: 'PENDING' },
    });
    if (existing) {
      return NextResponse.json({ error: 'You already have a pending request for this team' }, { status: 409 });
    }

    // Find team lead; if none, use the first member
    const lead = team.members[0];
    const toId = lead ? lead.userId : userId; // fallback: request stays visible to requester

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId,
        fromId: userId,
        toId,
        status: 'PENDING',
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        icon: 'send',
        color: 'var(--primary)',
        bgColor: 'rgba(0,74,198,0.1)',
        text: `<strong>Join Request Sent:</strong> You requested to join <em>${team.name}</em>.`,
      },
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — respond to a received invitation (ACCEPTED / DECLINED)
export async function PUT(req: Request) {
  try {
    const userId = await getUserId();
    const { invitationId, status } = await req.json();

    if (!invitationId || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid invitationId or status value' }, { status: 400 });
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.toId !== userId) {
      return NextResponse.json({ error: 'Unauthorized operation' }, { status: 403 });
    }

    // Update invitation status
    const updatedInvitation = await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status },
    });

    if (status === 'ACCEPTED') {
      const existingMember = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: invitation.teamId, userId } },
      });

      if (!existingMember) {
        await prisma.teamMember.create({
          data: { teamId: invitation.teamId, userId, isLead: false },
        });

        if (invitation.team.openPositions > 0) {
          await prisma.team.update({
            where: { id: invitation.teamId },
            data: { openPositions: { decrement: 1 } },
          });
        }
      }

      await prisma.activity.create({
        data: {
          userId,
          icon: 'groups',
          color: 'var(--tertiary)',
          bgColor: 'rgba(131,67,244,0.1)',
          text: `<strong>Joined Team:</strong> You accepted the invite to join <em>${invitation.team.name}</em>.`,
        },
      });
    } else {
      await prisma.activity.create({
        data: {
          userId,
          icon: 'block',
          color: 'var(--outline)',
          bgColor: 'rgba(195,198,215,0.2)',
          text: `<strong>Declined Invite:</strong> You declined the invite to join <em>${invitation.team.name}</em>.`,
        },
      });
    }

    return NextResponse.json({ success: true, invitation: updatedInvitation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: registrationId } = await params;
    const { action } = await req.json();

    // 1. Verify registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (action === 'complete') {
      const updatedReg = await prisma.registration.update({
        where: { id: registrationId },
        data: {
          courseCompleted: true,
        },
      });

      // Log course completion activity
      await prisma.activity.create({
        data: {
          userId: registration.userId,
          icon: 'school',
          color: 'var(--primary)',
          bgColor: 'rgba(0, 74, 198, 0.08)',
          text: `<strong>Course Completed:</strong> Approved completion for course <em>${registration.event.title}</em>.`,
        },
      });

      return NextResponse.json({ success: true, registration: updatedReg });
    }

    if (action === 'certificate') {
      // Create Certificate in database
      const certificate = await prisma.certificate.create({
        data: {
          userId: registration.userId,
          title: `Course Completion: ${registration.event.title}`,
          description: `Successfully completed the course/event "${registration.event.title}" under the ${registration.event.category} category.`,
          issuer: 'CampusConnect College Administration',
          credentialUrl: `https://credentials.campusconnect.edu/verify/cc-${registrationId}`,
          pdfUrl: `/certificates/cc-${registrationId}.pdf`,
        },
      });

      // Update registration to courseCompleted if it wasn't already
      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          courseCompleted: true,
        },
      });

      // Award student +100 points for earning a certificate!
      await prisma.user.update({
        where: { id: registration.userId },
        data: {
          points: {
            increment: 100,
          },
        },
      });

      // Log certificate activity
      await prisma.activity.create({
        data: {
          userId: registration.userId,
          icon: 'workspace_premium',
          color: 'var(--tertiary)',
          bgColor: 'rgba(131, 67, 244, 0.1)',
          text: `<strong>Certificate Earned:</strong> Received certificate for course <em>${registration.event.title}</em> (+100 pts).`,
        },
      });

      return NextResponse.json({ success: true, certificate });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

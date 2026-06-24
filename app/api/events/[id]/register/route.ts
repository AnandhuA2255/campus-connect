import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'alex-chen-id';

    // 1. Check if event exists and check capacity constraints
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 2. Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
    }

    if (event.registrations.length >= event.maxAttendees) {
      return NextResponse.json({ error: 'This event has reached maximum capacity' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, mobile, place, year, field, transactionId } = body;

    if (!event.isFree && (!transactionId || transactionId.trim() === '')) {
      return NextResponse.json({ error: 'Transaction ID is required for paid events.' }, { status: 400 });
    }

    // Fetch user details for defaults
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const defaultName = user?.name || "Student";
    const defaultEmail = user?.email || "";

    // 3. Register user and create unique QR code string
    const qrCodeString = `qr_token_${userId}_${eventId}_${Math.random().toString(36).substring(2, 9)}`;
    const registration = await prisma.registration.create({
      data: {
        userId,
        eventId,
        qrCodeString,
        name: name || defaultName,
        email: email || defaultEmail,
        mobile: mobile || "",
        place: place || "",
        year: year || "",
        field: field || "",
        transactionId: !event.isFree ? (transactionId || "") : null,
      },
    });

    // 4. Log recent activity
    await prisma.activity.create({
      data: {
        userId,
        icon: 'event_available',
        color: 'var(--primary)',
        bgColor: 'rgba(0, 74, 198, 0.08)',
        text: `<strong>Registered:</strong> You signed up for <em>${event.title}</em>.`,
      },
    });

    return NextResponse.json({ registration });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

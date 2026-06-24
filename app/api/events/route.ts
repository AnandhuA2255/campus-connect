import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        registrations: true,
      },
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'alex-chen-id';

    const data = await req.json();
    const { title, description, category, date, time, location, venue, imageUrl, maxAttendees, amount, isFree } = data;

    if (!title || !category || !location || !maxAttendees) {
      return NextResponse.json({ error: 'Missing required fields: Title, Category, Location, and Capacity' }, { status: 400 });
    }

    const eventIsFree = isFree === undefined ? true : !!isFree;
    const eventAmount = eventIsFree ? 0 : parseFloat(amount || '0');

    // Default thumbnails based on category if no image is supplied
    let defaultImg = imageUrl;
    if (!defaultImg || defaultImg.trim() === "") {
      switch (category) {
        case 'Innovation':
          defaultImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlIY7tlS6LsTOO71dYlkxmlec6kwy04IPZvZWUpe3zU6d-7gYqBDGV3XFDPvUqpvEYuidd_QshJGEpOIrIAkAkkgedppIWszDCWqKz93fdvx6pytozcTVoPlIrP0DC8w6KFSzvjvZ1OwLHdHmpSn0BtklOAIcXaNw1MUolgGTLb3MZBUeOYham0uo3qEZJ2VsTdb1pDXip-O0adDDmO_PhIsKMcNfPiyUiytAxs2MnttEgrKizqq2Wu9ErRLWznE8_VZYIVKc35-k';
          break;
        case 'Cultural':
          defaultImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWQrArleEetprvPK0x_mFd-3wTXaBHcbIz3OhuHSZIXbOyTFCtNbYZN83fwg2NDzMaSy5Jk6fZwFJQLajPkfcSXL1tfzF-TcO7OuCt9N2jBMhxcKm-Pbd0eTDSTHko1VjnSDL_ZSaHZUvGcs-caf-E8U9ZrYpETdaPZU-oWaLFZpLu2HrbptGW-Iy5QuQrfy-JrZodhq5WWBQm8MG-uqx3L0mo-hskkmCjnTmM3oH75R8grFtq704d5kZpZh3NOsBTluAMKfvaGWc';
          break;
        default:
          defaultImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWuCJky0j_vB58MDt2VGyY0Mug2xltrlh_OwEE4TxODBLZuNG7QkVq_jpMIJK9OhX16OjavcZZP_i1XLJKQOkkc0PeBRumEjX3OBcdzLzKsrvQuiyTH_6AW3jDDlYj-x5hucCBGJwflJrv0cRbY-iq4vj3Lh1cPws63TusUz649RX5SSUQsfNxjtd2yh9bzmwWubi90AykxdZJwJZ7L0OwtoJsmGvYMMTHV6tOC59qay3Oz2H1w2IllfhgjqDFbEjNvtVGj7SRf08';
      }
    }

    // Create the Event in DB
    const event = await prisma.event.create({
      data: {
        title,
        description: description || 'No description provided.',
        category,
        date: date || 'Nov 12, 2026',
        time: time || '10:00 AM - 04:00 PM',
        location,
        venue: venue || '',
        imageUrl: defaultImg,
        maxAttendees: parseInt(maxAttendees, 10),
        amount: eventAmount,
        isFree: eventIsFree,
      },
    });

    // Log Activity for event creator
    await prisma.activity.create({
      data: {
        userId,
        icon: 'event',
        color: 'var(--tertiary)',
        bgColor: 'rgba(131,67,244,0.1)',
        text: `<strong>Event Created:</strong> You published a new event <em>${title}</em>.`,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

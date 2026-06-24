const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clean DB
  await prisma.activity.deleteMany({});
  await prisma.teamInvitation.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.userSkill.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.event.deleteMany({});

  console.log('Database cleaned.');

  // Create default skills
  const skillsData = [
    // Tech
    { name: 'React', category: 'TECHNOLOGY' },
    { name: 'TypeScript', category: 'TECHNOLOGY' },
    { name: 'Python', category: 'TECHNOLOGY' },
    { name: 'TensorFlow', category: 'TECHNOLOGY' },
    { name: 'Node.js', category: 'TECHNOLOGY' },
    { name: 'SQL', category: 'TECHNOLOGY' },
    { name: 'Docker', category: 'TECHNOLOGY' },
    { name: 'Arduino', category: 'TECHNOLOGY' },
    { name: 'C++', category: 'TECHNOLOGY' },
    { name: 'PCB Design', category: 'TECHNOLOGY' },
    { name: 'Robotics', category: 'TECHNOLOGY' },
    { name: 'Data Science', category: 'TECHNOLOGY' },
    { name: 'ML', category: 'TECHNOLOGY' },
    { name: 'Tableau', category: 'TECHNOLOGY' },
    // Design
    { name: 'Figma', category: 'DESIGN' },
    { name: 'UI/UX', category: 'DESIGN' },
    { name: 'Illustrator', category: 'DESIGN' },
    // Business
    { name: 'Public Speaking', category: 'BUSINESS' },
    { name: 'Project Management', category: 'BUSINESS' },
    // Science
    { name: 'Statistics', category: 'SCIENCE' }
  ];

  const skills = {};
  for (const s of skillsData) {
    skills[s.name] = await prisma.skill.create({ data: s });
  }
  console.log('Skills seeded.');

  // Create default badges
  const badgesData = [
    { name: 'Volunteer', description: 'Earned by volunteering for 2+ campus events.', icon: 'military_tech', requirement: 'Volunteer for events' },
    { name: 'Tech Enthusiast', description: 'Earned by participating in 5+ technical workshops and hackathons.', icon: 'rocket_launch', requirement: 'Attend tech workshops' },
    { name: 'Collaborator', description: 'Earned by successfully building or joining 3+ project teams.', icon: 'groups', requirement: 'Join project teams' },
    { name: 'Innovator', description: 'Earned by presenting an innovative project at a campus hackathon.', icon: 'emoji_objects', requirement: 'Submit hackathon project' }
  ];

  const badges = {};
  for (const b of badgesData) {
    badges[b.name] = await prisma.badge.create({ data: b });
  }
  console.log('Badges seeded.');

  // Create users
  const alex = await prisma.user.create({
    data: {
      id: 'alex-chen-id',
      email: 'alex.chen@campusconnect.edu',
      name: 'Alex Chen',
      role: 'STUDENT',
      avatarUrl: 'AC',
      bio: 'Computer Science senior passionate about AI/ML, web technologies, and organizing technical workshops.',
      college: 'School of Engineering',
      department: 'Computer Science',
      graduationYear: '2026',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
      githubUrl: 'https://github.com/alexchen',
      points: 450,
      nationalRank: 42,
      collegeRank: 3,
      theme: 'light',
      highContrast: false,
      accentColor: 'blue',
      notifyReminds: true,
      notifyInvites: true,
      notifyMilestones: true
    }
  });

  const priya = await prisma.user.create({
    data: {
      id: 'priya-sharma-id',
      email: 'priya.sharma@campusconnect.edu',
      name: 'Priya Sharma',
      role: 'STUDENT',
      avatarUrl: 'PS',
      department: 'Computer Science',
      points: 2840,
      nationalRank: 1,
      collegeRank: 1
    }
  });

  const rahul = await prisma.user.create({
    data: {
      id: 'rahul-mehta-id',
      email: 'rahul.mehta@campusconnect.edu',
      name: 'Rahul Mehta',
      role: 'STUDENT',
      avatarUrl: 'RM',
      department: 'Electronics Eng.',
      points: 2680,
      nationalRank: 2,
      collegeRank: 2
    }
  });

  const ananya = await prisma.user.create({
    data: {
      id: 'ananya-krishnan-id',
      email: 'ananya.krishnan@campusconnect.edu',
      name: 'Ananya Krishnan',
      role: 'STUDENT',
      avatarUrl: 'AK',
      department: 'Data Science',
      points: 2510,
      nationalRank: 3,
      collegeRank: 3
    }
  });

  const sarah = await prisma.user.create({
    data: {
      id: 'sarah-johnson-id',
      email: 'sarah.j@campusconnect.edu',
      name: 'Sarah Johnson',
      role: 'STUDENT',
      avatarUrl: 'SJ',
      department: 'Mechanical Eng.',
      points: 2190,
      nationalRank: 5,
      collegeRank: 4
    }
  });

  const raj = await prisma.user.create({
    data: {
      id: 'raj-patel-id',
      email: 'raj.p@campusconnect.edu',
      name: 'Raj Patel',
      role: 'STUDENT',
      avatarUrl: 'RP',
      department: 'Computer Science',
      points: 1200,
      nationalRank: 15,
      collegeRank: 10
    }
  });

  console.log('Users seeded.');

  // Link skills to Alex
  const alexSkills = [
    { skill: 'React', level: 90 },
    { skill: 'TypeScript', level: 85 },
    { skill: 'Python', level: 75 },
    { skill: 'TensorFlow', level: 60 },
    { skill: 'Figma', level: 70 },
    { skill: 'Node.js', level: 80 },
    { skill: 'SQL', level: 75 },
    { skill: 'Docker', level: 50 }
  ];

  for (const item of alexSkills) {
    await prisma.userSkill.create({
      data: {
        userId: alex.id,
        skillId: skills[item.skill].id,
        level: item.level
      }
    });
  }

  // Link skills to other users (for matchmaking)
  const usersSkills = [
    { user: priya, skill: 'React', level: 95 },
    { user: priya, skill: 'Python', level: 80 },
    { user: priya, skill: 'UI/UX', level: 85 },
    { user: priya, skill: 'ML', level: 70 },
    
    { user: rahul, skill: 'Arduino', level: 90 },
    { user: rahul, skill: 'C++', level: 85 },
    { user: rahul, skill: 'PCB Design', level: 80 },
    { user: rahul, skill: 'Robotics', level: 75 },

    { user: ananya, skill: 'Data Science', level: 95 },
    { user: ananya, skill: 'Tableau', level: 90 },
    { user: ananya, skill: 'SQL', level: 85 },
    { user: ananya, skill: 'Statistics', level: 80 }
  ];

  for (const item of usersSkills) {
    await prisma.userSkill.create({
      data: {
        userId: item.user.id,
        skillId: skills[item.skill].id,
        level: item.level
      }
    });
  }

  console.log('UserSkills seeded.');

  // Link Badges to Alex
  await prisma.userBadge.create({
    data: {
      userId: alex.id,
      badgeId: badges['Volunteer'].id,
      unlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  });

  await prisma.userBadge.create({
    data: {
      userId: alex.id,
      badgeId: badges['Tech Enthusiast'].id,
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('UserBadges seeded.');

  // Create certificates for Alex
  await prisma.certificate.create({
    data: {
      userId: alex.id,
      title: 'Advanced Python Workshop Completion',
      description: 'Completed 12-hour training on advanced Python paradigms, async IO, and machine learning basics.',
      issuer: 'Innovation Hub, School of Engineering',
      issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.certificate.create({
    data: {
      userId: alex.id,
      title: 'UI/UX Design Masterclass',
      description: 'Mastering typography, visual systems, and interactive prototyping in Figma.',
      issuer: 'Design Collective Campus',
      issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Certificates seeded.');

  // Create events
  const event1 = await prisma.event.create({
    data: {
      id: 'event-1',
      title: 'Global Tech Summit 2026',
      description: 'The largest technical gathering on campus featuring keynotes from industry leaders, startup showcases, and networking sessions.',
      category: 'Innovation',
      date: 'Oct 24, 2026',
      time: '09:00 AM - 05:00 PM',
      location: 'Main Auditorium, Block C',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWuCJky0j_vB58MDt2VGyY0Mug2xltrlh_OwEE4TxODBLZuNG7QkVq_jpMIJK9OhX16OjavcZZP_i1XLJKQOkkc0PeBRumEjX3OBcdzLzKsrvQuiyTH_6AW3jDDlYj-x5hucCBGJwflJrv0cRbY-iq4vj3Lh1cPws63TusUz649RX5SSUQsfNxjtd2yh9bzmwWubi90AykxdZJwJZ7L0OwtoJsmGvYMMTHV6tOC59qay3Oz2H1w2IllfhgjqDFbEjNvtVGj7SRf08',
      maxAttendees: 500
    }
  });

  const event2 = await prisma.event.create({
    data: {
      id: 'event-2',
      title: 'Career Fair: Creative Industries',
      description: 'Meet recruiters from design agencies, media houses, gaming companies, and tech firms looking for creative talent.',
      category: 'Career',
      date: 'Oct 28, 2026',
      time: '11:30 AM - 02:00 PM',
      location: 'Student Union Plaza',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDmJSMZw9fqXDrsh7ww6Qs3kyTah3jV87cC9VP-mANjit1UiPPHr_FUVm5azCttt9gZFJEzBLIvgGI5u8en0AukTBKZA0vHECq0kNMikJIIcPt7CTJmJMke0zluB7qbK8hZtqjSvI3FYJr45hHF5k_fATzSaT0MXZdV5U1fnJO9GWUJ_oEDViq7Vl7zY4NhkU90dCJ2qHsCcs5w2VovD6N_cpvPEkgR45qpotaE-qgeqTr-UboWGfhxCZgamco0u6MNV4KW3IIvjg',
      maxAttendees: 300
    }
  });

  const event3 = await prisma.event.create({
    data: {
      id: 'event-3',
      title: 'NextGen Robotics Hackathon',
      description: 'A 48-hour challenge to design, program, and prototype autonomous robotic systems solving real-world campus problems.',
      category: 'Innovation',
      date: 'Nov 02-04, 2026',
      time: '09:00 AM (Day 1) - 06:00 PM (Day 3)',
      location: 'Innovation Hub, Building 4',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlIY7tlS6LsTOO71dYlkxmlec6kwy04IPZvZWUpe3zU6d-7gYqBDGV3XFDPvUqpvEYuidd_QshJGEpOIrIAkAkkgedppIWszDCWqKz93fdvx6pytozcTVoPlIrP0DC8w6KFSzvjvZ1OwLHdHmpSn0BtklOAIcXaNw1MUolgGTLb3MZBUeOYham0uo3qEZJ2VsTdb1pDXip-O0adDDmO_PhIsKMcNfPiyUiytAxs2MnttEgrKizqq2Wu9ErRLWznE8_VZYIVKc35-k',
      maxAttendees: 500
    }
  });

  const event4 = await prisma.event.create({
    data: {
      id: 'event-4',
      title: 'Inter-College Fusion Dance Fest',
      description: 'Annual dance competition featuring classical, contemporary, and hip-hop fusion styles from universities nationwide.',
      category: 'Cultural',
      date: 'Oct 15, 2026',
      time: '06:00 PM - 10:00 PM',
      location: 'Main Auditorium, West Campus',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWQrArleEetprvPK0x_mFd-3wTXaBHcbIz3OhuHSZIXbOyTFCtNbYZN83fwg2NDzMaSy5Jk6fZwFJQLajPkfcSXL1tfzF-TcO7OuCt9N2jBMhxcKm-Pbd0eTDSTHko1VjnSDL_ZSaHZUvGcs-caf-E8U9ZrYpETdaPZU-oWaLFZpLu2HrbptGW-Iy5QuQrfy-JrZodhq5WWBQm8MG-uqx3L0mo-hskkmCjnTmM3oH75R8grFtq704d5kZpZh3NOsBTluAMKfvaGWc',
      maxAttendees: 1000
    }
  });

  const event5 = await prisma.event.create({
    data: {
      id: 'event-5',
      title: 'Advanced Python & ML Workshop',
      description: 'Hands-on coding session covering asynchronous pipelines, custom neural network training, and deployment strategies.',
      category: 'Workshop',
      date: 'Oct 30, 2026',
      time: '09:00 AM - 04:00 PM',
      location: 'Lab Complex, Block B',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWuCJky0j_vB58MDt2VGyY0Mug2xltrlh_OwEE4TxODBLZuNG7QkVq_jpMIJK9OhX16OjavcZZP_i1XLJKQOkkc0PeBRumEjX3OBcdzLzKsrvQuiyTH_6AW3jDDlYj-x5hucCBGJwflJrv0cRbY-iq4vj3Lh1cPws63TusUz649RX5SSUQsfNxjtd2yh9bzmwWubi90AykxdZJwJZ7L0OwtoJsmGvYMMTHV6tOC59qay3Oz2H1w2IllfhgjqDFbEjNvtVGj7SRf08',
      maxAttendees: 100
    }
  });

  console.log('Events seeded.');

  // Create registrations for Alex
  await prisma.registration.create({
    data: {
      userId: alex.id,
      eventId: event1.id,
      qrCodeString: 'qr_alex_event_1'
    }
  });

  await prisma.registration.create({
    data: {
      userId: alex.id,
      eventId: event2.id,
      qrCodeString: 'qr_alex_event_2'
    }
  });

  // Add registrations for other users to simulate analytics
  const randomUsers = [priya, rahul, ananya, sarah, raj];
  for (const u of randomUsers) {
    await prisma.registration.create({
      data: {
        userId: u.id,
        eventId: event1.id,
        qrCodeString: `qr_${u.avatarUrl}_event_1`,
        registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log('Registrations seeded.');

  // Create teams for events
  const team1 = await prisma.team.create({
    data: {
      id: 'team-1',
      name: 'Team Nexus',
      projectDescription: 'AI-powered campus navigation system',
      openPositions: 1,
      eventId: event3.id
    }
  });

  const team2 = await prisma.team.create({
    data: {
      id: 'team-2',
      name: 'Circuit Breakers',
      projectDescription: 'Autonomous sorting robot for recycling',
      openPositions: 2,
      eventId: event3.id
    }
  });

  const team3 = await prisma.team.create({
    data: {
      id: 'team-3',
      name: 'DataForge',
      projectDescription: 'Student performance analytics dashboard',
      openPositions: 1,
      eventId: event3.id
    }
  });

  console.log('Teams seeded.');

  // Link members to teams
  await prisma.teamMember.create({
    data: { teamId: team1.id, userId: priya.id, isLead: true }
  });
  await prisma.teamMember.create({
    data: { teamId: team1.id, userId: rahul.id, isLead: false }
  });
  await prisma.teamMember.create({
    data: { teamId: team1.id, userId: ananya.id, isLead: false }
  });

  await prisma.teamMember.create({
    data: { teamId: team2.id, userId: sarah.id, isLead: true }
  });

  await prisma.teamMember.create({
    data: { teamId: team3.id, userId: priya.id, isLead: true }
  });

  console.log('TeamMembers seeded.');

  // Team Invitations
  await prisma.teamInvitation.create({
    data: {
      teamId: team1.id,
      fromId: priya.id,
      toId: alex.id,
      status: 'PENDING'
    }
  });

  await prisma.teamInvitation.create({
    data: {
      teamId: team2.id,
      fromId: sarah.id,
      toId: alex.id,
      status: 'ACCEPTED',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.teamInvitation.create({
    data: {
      teamId: team3.id,
      fromId: priya.id,
      toId: alex.id,
      status: 'DECLINED',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Team Invitations seeded.');

  // Activities for Alex
  await prisma.activity.create({
    data: {
      userId: alex.id,
      icon: 'military_tech',
      color: 'var(--secondary)',
      bgColor: 'rgba(108,248,187,0.15)',
      text: '<strong>Achievement Unlocked:</strong> You earned the \'Volunteer\' badge!',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  });

  await prisma.activity.create({
    data: {
      userId: alex.id,
      icon: 'groups',
      color: 'var(--tertiary)',
      bgColor: 'rgba(131,67,244,0.1)',
      text: '<strong>Team Invitation:</strong> Tech Summit 2026 Hackathon invite from Sarah K.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  });

  await prisma.activity.create({
    data: {
      userId: alex.id,
      icon: 'history_edu',
      color: 'var(--primary)',
      bgColor: 'rgba(0,74,198,0.08)',
      text: '<strong>Certificate Issued:</strong> Advanced Python Workshop Completion.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.activity.create({
    data: {
      userId: alex.id,
      icon: 'verified_user',
      color: 'var(--outline)',
      bgColor: 'rgba(195,198,215,0.2)',
      text: 'Your profile was verified by the Registrar Office.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Activities seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

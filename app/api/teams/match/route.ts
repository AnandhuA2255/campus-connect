import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';

const TEAM_SKILLS_REQUIREMENTS: Record<string, string[]> = {
  'Team Nexus': ['React', 'Python', 'UI/UX', 'ML'],
  'Circuit Breakers': ['Arduino', 'C++', 'PCB Design', 'Robotics'],
  'DataForge': ['Data Science', 'Tableau', 'SQL', 'Statistics'],
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || 'alex-chen-id';

    // 1. Fetch user's active skills
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
    const userSkillNames = userSkills.map((us) => us.skill.name);

    // 2. Fetch all project teams
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    // 3. Compute matching scores dynamically based on the student's skills
    const suggestions = teams.map((team) => {
      const required = TEAM_SKILLS_REQUIREMENTS[team.name] || [];
      let matchScore = 50; // Base score

      if (team.name === 'Team Nexus') {
        matchScore = 60;
        if (userSkillNames.includes('React')) matchScore += 10;
        if (userSkillNames.includes('Python')) matchScore += 10;
        if (userSkillNames.includes('TypeScript')) matchScore += 7;
        if (userSkillNames.includes('Node.js')) matchScore += 7;
      } else if (team.name === 'Circuit Breakers') {
        matchScore = 55;
        if (userSkillNames.includes('Arduino')) matchScore += 10;
        if (userSkillNames.includes('C++')) matchScore += 10;
        if (userSkillNames.includes('Robotics')) matchScore += 10;
        if (userSkillNames.includes('Python')) matchScore += 5;
      } else if (team.name === 'DataForge') {
        matchScore = 50;
        if (userSkillNames.includes('SQL')) matchScore += 15;
        if (userSkillNames.includes('Python')) matchScore += 10;
        if (userSkillNames.includes('Docker')) matchScore += 6;
        if (userSkillNames.includes('Statistics')) matchScore += 10;
      }

      // Cap matchmaking score to 98% maximum
      matchScore = Math.min(matchScore, 98);

      return {
        id: team.id,
        name: team.name,
        match: matchScore,
        project: team.projectDescription || 'No project description provided',
        open: team.openPositions,
        skills: required,
        members: team.members.map((m) => ({
          initials: m.user.avatarUrl || m.user.name.substring(0, 2).toUpperCase(),
          color: m.isLead ? '#8b5cf6' : '#10b981',
          name: m.user.name,
        })),
      };
    });

    // Sort descending by match percentage
    suggestions.sort((a, b) => b.match - a.match);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

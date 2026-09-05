import {
  PrismaClient,
  RoleType,
  OrgStatus,
  OrgType,
  OrgMemberRole,
  EventStatus,
  EventMode,
  OpportunityCategoryType,
  RegistrationStatus,
  TeamRole,
  TeamRequestStatus,
  NotificationType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for CampusPulse...');

  // ---------------------------------------------------------------------------
  // 1. Roles
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding roles...');
  const roleTypes: { name: RoleType; description: string }[] = [
    { name: RoleType.STUDENT, description: 'Undergraduate or postgraduate student user' },
    { name: RoleType.ORGANIZER, description: 'Club, society, or event organizer' },
    { name: RoleType.FACULTY, description: 'Academic staff or faculty administrator' },
    { name: RoleType.UNIVERSITY_ADMIN, description: 'University level administrator' },
    { name: RoleType.COMPANY, description: 'Corporate employer or industry partner' },
    { name: RoleType.ADMIN, description: 'CampusPulse platform administrator' },
    { name: RoleType.SUPER_ADMIN, description: 'System super administrator' },
  ];

  const roleMap = new Map<RoleType, string>();
  for (const r of roleTypes) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
    roleMap.set(r.name, role.id);
  }

  // ---------------------------------------------------------------------------
  // 2. Universities, Faculties & Departments
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding universities, faculties, and departments...');

  // University of Colombo
  const uoc = await prisma.university.upsert({
    where: { slug: 'uoc' },
    update: {},
    create: {
      name: 'University of Colombo',
      slug: 'uoc',
      code: 'UOC',
      city: 'Colombo',
      domain: 'cmb.ac.lk',
      websiteUrl: 'https://cmb.ac.lk',
      description:
        'The oldest university in Sri Lanka, offering premier education in science, technology, medicine, and arts.',
      isVerified: true,
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop',
    },
  });

  const uocScience = await prisma.faculty.upsert({
    where: { universityId_slug: { universityId: uoc.id, slug: 'science' } },
    update: {},
    create: {
      universityId: uoc.id,
      name: 'Faculty of Science',
      slug: 'science',
      code: 'FOS-UOC',
      description: 'Leading research faculty in biological and physical sciences.',
    },
  });

  const uocCS = await prisma.department.upsert({
    where: { facultyId_slug: { facultyId: uocScience.id, slug: 'computer-science' } },
    update: {},
    create: {
      facultyId: uocScience.id,
      name: 'Department of Computer Science',
      slug: 'computer-science',
      code: 'DCS-UOC',
    },
  });

  const uocTech = await prisma.faculty.upsert({
    where: { universityId_slug: { universityId: uoc.id, slug: 'technology' } },
    update: {},
    create: {
      universityId: uoc.id,
      name: 'Faculty of Technology',
      slug: 'technology',
      code: 'FOT-UOC',
      description:
        'Focusing on biosystems, instrumentation, and information technology engineering.',
    },
  });

  const uocIT = await prisma.department.upsert({
    where: { facultyId_slug: { facultyId: uocTech.id, slug: 'information-technology' } },
    update: {},
    create: {
      facultyId: uocTech.id,
      name: 'Department of Information & Communication Technology',
      slug: 'information-technology',
      code: 'DICT-UOC',
    },
  });

  // University of Moratuwa
  const uom = await prisma.university.upsert({
    where: { slug: 'uom' },
    update: {},
    create: {
      name: 'University of Moratuwa',
      slug: 'uom',
      code: 'UOM',
      city: 'Moratuwa',
      domain: 'uom.lk',
      websiteUrl: 'https://uom.lk',
      description:
        'Sri Lanka’s premier technological university renowned for engineering, IT, and architecture.',
      isVerified: true,
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop',
    },
  });

  const uomEng = await prisma.faculty.upsert({
    where: { universityId_slug: { universityId: uom.id, slug: 'engineering' } },
    update: {},
    create: {
      universityId: uom.id,
      name: 'Faculty of Engineering',
      slug: 'engineering',
      code: 'FOE-UOM',
      description: 'The foremost engineering faculty in the island.',
    },
  });

  const uomCSE = await prisma.department.upsert({
    where: { facultyId_slug: { facultyId: uomEng.id, slug: 'cse' } },
    update: {},
    create: {
      facultyId: uomEng.id,
      name: 'Department of Computer Science & Engineering',
      slug: 'cse',
      code: 'CSE-UOM',
    },
  });

  const uomENTC = await prisma.department.upsert({
    where: { facultyId_slug: { facultyId: uomEng.id, slug: 'entc' } },
    update: {},
    create: {
      facultyId: uomEng.id,
      name: 'Department of Electronic & Telecommunication Engineering',
      slug: 'entc',
      code: 'ENTC-UOM',
    },
  });

  // University of Peradeniya
  const uop = await prisma.university.upsert({
    where: { slug: 'uop' },
    update: {},
    create: {
      name: 'University of Peradeniya',
      slug: 'uop',
      code: 'UOP',
      city: 'Peradeniya',
      domain: 'pdn.ac.lk',
      websiteUrl: 'https://pdn.ac.lk',
      description: 'The largest university in Sri Lanka set in the scenic Mahaweli valley.',
      isVerified: true,
      logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop',
    },
  });

  const uopEng = await prisma.faculty.upsert({
    where: { universityId_slug: { universityId: uop.id, slug: 'engineering' } },
    update: {},
    create: {
      universityId: uop.id,
      name: 'Faculty of Engineering',
      slug: 'engineering',
      code: 'FOE-UOP',
    },
  });

  const uopEE = await prisma.department.upsert({
    where: { facultyId_slug: { facultyId: uopEng.id, slug: 'electrical-electronic' } },
    update: {},
    create: {
      facultyId: uopEng.id,
      name: 'Department of Electrical & Electronic Engineering',
      slug: 'electrical-electronic',
      code: 'DEEE-UOP',
    },
  });

  // ---------------------------------------------------------------------------
  // 3. Controlled Opportunity Categories
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding categories...');
  const categories = [
    {
      name: 'Hackathons & Competitions',
      slug: 'competitions',
      type: OpportunityCategoryType.COMPETITIVE,
      icon: 'trophy',
      description: 'Coding challenges, hackathons, math olympiads, and case competitions.',
    },
    {
      name: 'Career & Internship Fairs',
      slug: 'career',
      type: OpportunityCategoryType.CAREER,
      icon: 'briefcase',
      description: 'Campus hiring drives, CV clinics, mock interviews, and career networking.',
    },
    {
      name: 'Research & Academic Symposia',
      slug: 'research',
      type: OpportunityCategoryType.RESEARCH,
      icon: 'flask',
      description:
        'Faculty research presentations, journal call-for-papers, and scientific colloquia.',
    },
    {
      name: 'Workshops & Tech Talks',
      slug: 'academic',
      type: OpportunityCategoryType.ACADEMIC,
      icon: 'book-open',
      description: 'Hands-on skill building sessions, bootcamps, and guest lectures.',
    },
    {
      name: 'Cultural & Performing Arts',
      slug: 'cultural',
      type: OpportunityCategoryType.CULTURAL,
      icon: 'palette',
      description: 'Drama festivals, musical soirees, traditional dance, and literature fests.',
    },
    {
      name: 'Sports Tournaments',
      slug: 'sports',
      type: OpportunityCategoryType.SPORTS,
      icon: 'activity',
      description: 'Inter-faculty matches, cricket championships, futsal leagues, and chess.',
    },
    {
      name: 'Social & Campus Life',
      slug: 'social',
      type: OpportunityCategoryType.SOCIAL,
      icon: 'users',
      description: 'Freshers welcomes, orientation events, trivia nights, and networking mixers.',
    },
    {
      name: 'Music & Concerts',
      slug: 'music',
      type: OpportunityCategoryType.MUSIC,
      icon: 'music',
      description: 'Acoustic campus nights, live band concerts, and choral recitals.',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, type: cat.type, icon: cat.icon, description: cat.description },
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  // ---------------------------------------------------------------------------
  // 4. Users & Profiles (Realistic non-PII test accounts)
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding test accounts...');

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campuspulse.test' },
    update: {},
    create: {
      email: 'admin@campuspulse.test',
      name: 'Platform Administrator',
      isEmailVerified: true,
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    },
  });
  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: roleMap.get(RoleType.ADMIN)! } },
    update: {},
    create: { userId: adminUser.id, roleId: roleMap.get(RoleType.ADMIN)! },
  });

  // Organizer user
  const organizerUser = await prisma.user.upsert({
    where: { email: 'organizer@ieee-uom.test' },
    update: {},
    create: {
      email: 'organizer@ieee-uom.test',
      name: 'Naveen Silva',
      isEmailVerified: true,
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    },
  });
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: { userId: organizerUser.id, roleId: roleMap.get(RoleType.ORGANIZER)! },
    },
    update: {},
    create: { userId: organizerUser.id, roleId: roleMap.get(RoleType.ORGANIZER)! },
  });

  // Student 1 (Colombo CS)
  const student1 = await prisma.user.upsert({
    where: { email: 'ayesha.fernando@student.uoc.test' },
    update: {},
    create: {
      email: 'ayesha.fernando@student.uoc.test',
      name: 'Ayesha Fernando',
      isEmailVerified: true,
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    },
  });
  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId: { userId: student1.id, roleId: roleMap.get(RoleType.STUDENT)! } },
    update: {},
    create: { userId: student1.id, roleId: roleMap.get(RoleType.STUDENT)! },
  });
  await prisma.studentProfile.upsert({
    where: { userId: student1.id },
    update: {},
    create: {
      userId: student1.id,
      universityId: uoc.id,
      facultyId: uocScience.id,
      departmentId: uocCS.id,
      studentIdNumber: 'S20230041',
      batchYear: 2023,
      bio: 'Third-year computer science undergrad interested in distributed systems, full-stack development, and competitive programming.',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      skills: ['TypeScript', 'Next.js', 'NestJS', 'PostgreSQL', 'Docker'],
      interests: ['Hackathons', 'AI Research', 'Open Source'],
    },
  });

  // Student 2 (Moratuwa CSE)
  const student2 = await prisma.user.upsert({
    where: { email: 'kasun.bandara@student.uom.test' },
    update: {},
    create: {
      email: 'kasun.bandara@student.uom.test',
      name: 'Kasun Bandara',
      isEmailVerified: true,
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    },
  });
  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId: { userId: student2.id, roleId: roleMap.get(RoleType.STUDENT)! } },
    update: {},
    create: { userId: student2.id, roleId: roleMap.get(RoleType.STUDENT)! },
  });
  await prisma.studentProfile.upsert({
    where: { userId: student2.id },
    update: {},
    create: {
      userId: student2.id,
      universityId: uom.id,
      facultyId: uomEng.id,
      departmentId: uomCSE.id,
      studentIdNumber: '210045B',
      batchYear: 2022,
      bio: 'Electronic & Computer systems enthusiast, robotics hobbyist, and ML researcher.',
      githubUrl: 'https://github.com',
      skills: ['Python', 'PyTorch', 'C++', 'Embedded Systems', 'ROS'],
      interests: ['Robotics', 'Deep Learning', 'Quantum Computing'],
    },
  });

  // Student 3 (Peradeniya)
  const student3 = await prisma.user.upsert({
    where: { email: 'dilani.jayawardena@student.pdn.test' },
    update: {},
    create: {
      email: 'dilani.jayawardena@student.pdn.test',
      name: 'Dilani Jayawardena',
      isEmailVerified: true,
      isActive: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    },
  });
  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId: { userId: student3.id, roleId: roleMap.get(RoleType.STUDENT)! } },
    update: {},
    create: { userId: student3.id, roleId: roleMap.get(RoleType.STUDENT)! },
  });
  await prisma.studentProfile.upsert({
    where: { userId: student3.id },
    update: {},
    create: {
      userId: student3.id,
      universityId: uop.id,
      facultyId: uopEng.id,
      departmentId: uopEE.id,
      studentIdNumber: 'E/20/182',
      batchYear: 2021,
      bio: 'Final year engineering student passionate about renewable energy, microgrid automation, and IoT.',
      skills: ['MATLAB', 'Circuit Design', 'IoT', 'Power Systems'],
      interests: ['Clean Energy', 'Sustainability', 'Badminton'],
    },
  });

  // ---------------------------------------------------------------------------
  // 5. Student Organizations & Memberships
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding organizations and memberships...');

  const ieeeUom = await prisma.organization.upsert({
    where: { slug: 'ieee-uom' },
    update: {},
    create: {
      name: 'IEEE Student Branch of University of Moratuwa',
      slug: 'ieee-uom',
      universityId: uom.id,
      type: OrgType.STUDENT_CLUB,
      status: OrgStatus.APPROVED,
      isVerified: true,
      email: 'ieee@uom.lk',
      websiteUrl: 'https://ieee.uom.lk',
      description:
        'One of the most active IEEE student branches in South Asia, hosting flagship national hackathons, technical conferences, and workshops.',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop',
    },
  });
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: ieeeUom.id, userId: organizerUser.id } },
    update: {},
    create: {
      organizationId: ieeeUom.id,
      userId: organizerUser.id,
      role: OrgMemberRole.LEADER,
      title: 'Branch Chairperson',
    },
  });

  const acmUoc = await prisma.organization.upsert({
    where: { slug: 'acm-uoc' },
    update: {},
    create: {
      name: 'ACM Student Chapter — University of Colombo',
      slug: 'acm-uoc',
      universityId: uoc.id,
      type: OrgType.ACADEMIC_SOCIETY,
      status: OrgStatus.APPROVED,
      isVerified: true,
      email: 'acm@cmb.ac.lk',
      description:
        'Empowering computer science students through coding sessions, research seminars, and inter-university algorithm contests.',
      logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop',
    },
  });
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: acmUoc.id, userId: student1.id } },
    update: {},
    create: {
      organizationId: acmUoc.id,
      userId: student1.id,
      role: OrgMemberRole.MANAGER,
      title: 'Event Coordinator',
    },
  });

  const rotaractUop = await prisma.organization.upsert({
    where: { slug: 'rotaract-uop' },
    update: {},
    create: {
      name: 'Rotaract Club of University of Peradeniya',
      slug: 'rotaract-uop',
      universityId: uop.id,
      type: OrgType.COMMUNITY,
      status: OrgStatus.APPROVED,
      isVerified: true,
      description:
        'Dedicated to fellowship, community service, professional development, and cultural outreach across the hill country.',
    },
  });

  // ---------------------------------------------------------------------------
  // 6. Events & Opportunities
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding events...');

  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // Event 1: Flagship Hackathon
  const hackathon = await prisma.event.upsert({
    where: { slug: 'morahack-2026' },
    update: {},
    create: {
      organizationId: ieeeUom.id,
      categoryId: categoryMap.get('competitions')!,
      title: 'MoraHack 2026: National Inter-University Hackathon',
      slug: 'morahack-2026',
      shortDescription:
        'A 24-hour national hackathon challenging student innovators to build AI-driven solutions for real-world sustainability challenges.',
      description: `Join over 500 top student engineers, developers, and designers from across Sri Lanka in the flagship edition of MoraHack 2026!

### Tracks:
1. AI & Autonomous Systems
2. FinTech & Decentralized Identity
3. Smart Cities & Climate Resilience
4. Healthcare & Telemedicine

Teams of 3 to 4 students will compete for a cash prize pool of Rs. 1,000,000 and direct internship interviews with leading tech enterprises.`,
      status: EventStatus.PUBLISHED,
      mode: EventMode.HYBRID,
      venue: 'Civil Auditorium & Virtual Sandbox, University of Moratuwa',
      meetingUrl: 'https://meet.campuspulse.test/morahack-2026',
      startDate: daysFromNow(20),
      endDate: daysFromNow(21),
      registrationDeadline: daysFromNow(14),
      capacity: 300,
      isFree: true,
      featured: true,
      tags: ['Hackathon', 'AI', 'Coding', 'Inter-University', 'Prizes'],
      bannerUrl:
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
    },
  });

  // Event 2: Career Expo
  await prisma.event.upsert({
    where: { slug: 'colombo-tech-career-expo-2026' },
    update: {},
    create: {
      organizationId: acmUoc.id,
      categoryId: categoryMap.get('career')!,
      title: 'Annual Tech Career Expo & Internship Fair',
      slug: 'colombo-tech-career-expo-2026',
      shortDescription:
        'Connect directly with hiring leads and software engineering managers from top tech companies and startups.',
      description: `The University of Colombo ACM Chapter presents the Annual Tech Career Expo!
Meet recruiters from 35+ tech firms, attend 1-on-1 resume reviews, and apply on-the-spot for graduate software engineer and intern positions.`,
      status: EventStatus.PUBLISHED,
      mode: EventMode.IN_PERSON,
      venue: 'New Arts Theatre (NAT), University of Colombo',
      startDate: daysFromNow(10),
      endDate: daysFromNow(10),
      registrationDeadline: daysFromNow(7),
      capacity: 600,
      isFree: true,
      featured: true,
      tags: ['Career', 'Internship', 'Jobs', 'Networking', 'Software'],
      bannerUrl:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=600&fit=crop',
    },
  });

  // Event 3: Research Symposium
  await prisma.event.upsert({
    where: { slug: 'ai-research-symposium-2026' },
    update: {},
    create: {
      organizationId: acmUoc.id,
      categoryId: categoryMap.get('research')!,
      title: 'Symposium on Applied Machine Learning & Generative Models',
      slug: 'ai-research-symposium-2026',
      shortDescription:
        'Distinguished faculty and PhD candidates showcase state-of-the-art research papers in computer vision and NLP.',
      description: `A whole-day research colloquium spotlighting peer-reviewed paper presentations in foundation models, multilingual speech synthesis, and healthcare analytics.`,
      status: EventStatus.PUBLISHED,
      mode: EventMode.HYBRID,
      venue: 'Department of Computer Science Auditorium, UOC',
      meetingUrl: 'https://meet.campuspulse.test/symposium-ml-2026',
      startDate: daysFromNow(30),
      endDate: daysFromNow(30),
      registrationDeadline: daysFromNow(25),
      capacity: 150,
      isFree: true,
      featured: false,
      tags: ['Research', 'Machine Learning', 'NLP', 'Computer Vision'],
      bannerUrl:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
    },
  });

  // Event 4: Acoustic Night (Cultural)
  await prisma.event.upsert({
    where: { slug: 'acoustic-campus-night-peradeniya' },
    update: {},
    create: {
      organizationId: rotaractUop.id,
      categoryId: categoryMap.get('music')!,
      title: 'Acoustic Campus Night & Cultural Fest 2026',
      slug: 'acoustic-campus-night-peradeniya',
      shortDescription:
        'An evening of unplugged musical performances and collaborative art under the starry skies of Peradeniya.',
      description: `Experience the soulful acoustic sounds of university student bands and renowned local indie artists in an open-air atmosphere surrounded by the Hantana mountain range.`,
      status: EventStatus.PUBLISHED,
      mode: EventMode.IN_PERSON,
      venue: 'Open Air Amphitheatre, University of Peradeniya',
      startDate: daysFromNow(18),
      endDate: daysFromNow(18),
      capacity: 1000,
      isFree: true,
      featured: true,
      tags: ['Music', 'Acoustic', 'Cultural', 'Social'],
      bannerUrl:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=600&fit=crop',
    },
  });

  // ---------------------------------------------------------------------------
  // 7. Event Registrations & Bookmarks
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding event registrations and bookmarks...');

  // Student 1 registers for Hackathon
  await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: hackathon.id, userId: student1.id } },
    update: {},
    create: {
      eventId: hackathon.id,
      userId: student1.id,
      status: RegistrationStatus.REGISTERED,
    },
  });

  // Student 2 registers for Hackathon
  await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: hackathon.id, userId: student2.id } },
    update: {},
    create: {
      eventId: hackathon.id,
      userId: student2.id,
      status: RegistrationStatus.REGISTERED,
    },
  });

  // Student 3 bookmarks Hackathon
  await prisma.eventBookmark.upsert({
    where: { eventId_userId: { eventId: hackathon.id, userId: student3.id } },
    update: {},
    create: {
      eventId: hackathon.id,
      userId: student3.id,
    },
  });

  // ---------------------------------------------------------------------------
  // 8. Teams & Team Finder
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding teams and join requests...');

  const team = await prisma.team.upsert({
    where: { id: 'seed-team-binarypulse' },
    update: {},
    create: {
      id: 'seed-team-binarypulse',
      eventId: hackathon.id,
      creatorId: student1.id,
      name: 'BinaryPulse Innovators',
      description:
        'Looking for an ML engineer and a UI/UX designer to build an AI carbon footprint auditor for university campuses.',
      maxMembers: 4,
      isOpen: true,
    },
  });

  // Team Leader
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: student1.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: student1.id,
      role: TeamRole.LEADER,
    },
  });

  // Team Member 2
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: student2.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: student2.id,
      role: TeamRole.MEMBER,
    },
  });

  // Join Request from Student 3
  await prisma.teamJoinRequest.upsert({
    where: { teamId_userId: { teamId: team.id, userId: student3.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: student3.id,
      status: TeamRequestStatus.PENDING,
      message:
        'Hi! I have extensive experience with IoT sensors and energy systems. I would love to build the hardware/sensor ingestion layer for your project!',
    },
  });

  // ---------------------------------------------------------------------------
  // 9. Sample Notifications
  // ---------------------------------------------------------------------------
  console.log('  -> Seeding notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: 'Registration Confirmed',
        message: 'Your registration for MoraHack 2026 has been successfully confirmed.',
        type: NotificationType.REGISTRATION_CONFIRMED,
        isRead: true,
        linkUrl: '/events/morahack-2026',
      },
      {
        userId: student1.id,
        title: 'New Team Join Request',
        message: 'Dilani Jayawardena requested to join BinaryPulse Innovators.',
        type: NotificationType.TEAM_UPDATE,
        isRead: false,
        linkUrl: '/teams/seed-team-binarypulse',
      },
      {
        userId: student2.id,
        title: 'Welcome to Team BinaryPulse',
        message: 'You have been added to BinaryPulse Innovators for MoraHack 2026.',
        type: NotificationType.TEAM_INVITE,
        isRead: false,
        linkUrl: '/teams/seed-team-binarypulse',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

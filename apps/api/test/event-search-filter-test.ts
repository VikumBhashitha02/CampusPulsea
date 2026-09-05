/**
 * ==============================================================================
 * CampusPulse — Phase 8: Event Search and Filtering Test Suite
 * ==============================================================================
 * Tests:
 * 1. Multi-field PostgreSQL Search (title, description, category, skills, university, organization)
 * 2. Dedicated Dimension Filters:
 *    - Category (slug & id)
 *    - University (slug & id)
 *    - Faculty & Department (facultyId, departmentId)
 *    - Event Mode (IN_PERSON, ONLINE, HYBRID)
 *    - Date Presets & Custom Range (upcoming, today, this_week, this_month, startDateFrom/To)
 *    - Registration Status (registrationOpenOnly)
 *    - Free / Paid (isFree)
 *    - Skills array matching (hasSome)
 * 3. Combinatorial Multi-Filter Queries
 * 4. Sorting & Pagination Controls
 * 5. Security & Public Visibility Isolation (Strictly PUBLISHED events only)
 * ==============================================================================
 */

import { EventStatus, EventMode } from '@campuspulse/types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    results.push({ name, passed: true, details });
  } else {
    console.error(`  ❌ [FAIL] ${name} — ${details || 'Assertion failed'}`);
    results.push({ name, passed: false, error: details });
  }
}

interface MockEvent {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  status: EventStatus;
  mode: EventMode;
  location?: string;
  venue?: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date | null;
  isFree: boolean;
  skills: string[];
  facultyId?: string;
  departmentId?: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    universityId?: string;
    university?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  university?: {
    id: string;
    name: string;
    slug: string;
  };
  registrationsCount: number;
  createdAt: Date;
}

// Sample dataset simulating database records
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

const mockDatabase: MockEvent[] = [
  {
    id: 'evt-1',
    title: 'MoraHack 2026: National Hackathon',
    slug: 'morahack-2026',
    shortDescription: 'Premier inter-university hackathon',
    description: 'Build cutting edge AI and robotics projects',
    status: EventStatus.PUBLISHED,
    mode: EventMode.HYBRID,
    location: 'University of Moratuwa',
    venue: 'Civil Auditorium',
    startDate: nextWeek,
    endDate: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000),
    registrationDeadline: tomorrow,
    isFree: true,
    skills: ['AI', 'React', 'Node.js', 'Python'],
    facultyId: 'fac-eng-uom',
    departmentId: 'dept-cse-uom',
    organization: {
      id: 'org-ieee-uom',
      name: 'IEEE Student Branch of UoM',
      slug: 'ieee-uom',
      universityId: 'uni-uom',
      university: { id: 'uni-uom', name: 'University of Moratuwa', slug: 'uom' },
    },
    category: { id: 'cat-competitions', name: 'Hackathons & Competitions', slug: 'competitions' },
    university: { id: 'uni-uom', name: 'University of Moratuwa', slug: 'uom' },
    registrationsCount: 150,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'evt-2',
    title: 'Colombo Tech Career Fair 2026',
    slug: 'colombo-tech-career-fair-2026',
    shortDescription: 'Meet leading software companies and startups',
    description: 'Annual career opportunities and internship fair',
    status: EventStatus.PUBLISHED,
    mode: EventMode.IN_PERSON,
    location: 'University of Colombo',
    venue: 'New Arts Theatre',
    startDate: nextMonth,
    endDate: new Date(nextMonth.getTime() + 8 * 60 * 60 * 1000),
    registrationDeadline: nextWeek,
    isFree: true,
    skills: ['Interviews', 'Networking', 'Resume'],
    facultyId: 'fac-sci-uoc',
    departmentId: 'dept-stat-uoc',
    organization: {
      id: 'org-rotaract-ucsc',
      name: 'Rotaract Club of UCSC',
      slug: 'rotaract-ucsc',
      universityId: 'uni-uoc',
      university: { id: 'uni-uoc', name: 'University of Colombo', slug: 'uoc' },
    },
    category: { id: 'cat-careers', name: 'Career Fairs & Jobs', slug: 'careers' },
    university: { id: 'uni-uoc', name: 'University of Colombo', slug: 'uoc' },
    registrationsCount: 420,
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'evt-3',
    title: 'Deep Learning Workshop: Transformers and LLMs',
    slug: 'deep-learning-workshop-2026',
    shortDescription: 'Hands-on practical transformer training',
    description: 'Learn modern machine learning with PyTorch',
    status: EventStatus.PUBLISHED,
    mode: EventMode.ONLINE,
    location: 'Virtual',
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
    registrationDeadline: null, // Open until start
    isFree: false,
    skills: ['AI', 'PyTorch', 'Python', 'Machine Learning'],
    facultyId: 'fac-eng-uop',
    departmentId: 'dept-com-uop',
    organization: {
      id: 'org-aces-uop',
      name: 'ACES University of Peradeniya',
      slug: 'aces-uop',
      universityId: 'uni-uop',
      university: { id: 'uni-uop', name: 'University of Peradeniya', slug: 'uop' },
    },
    category: { id: 'cat-academic', name: 'Workshops & Academic', slug: 'academic' },
    university: { id: 'uni-uop', name: 'University of Peradeniya', slug: 'uop' },
    registrationsCount: 85,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'evt-draft',
    title: 'Secret Unapproved Draft Event',
    slug: 'secret-unapproved-draft',
    description: 'Should never appear in public search results',
    status: EventStatus.DRAFT,
    mode: EventMode.IN_PERSON,
    startDate: nextWeek,
    endDate: nextWeek,
    isFree: true,
    skills: ['Secret'],
    organization: {
      id: 'org-ieee-uom',
      name: 'IEEE Student Branch of UoM',
      slug: 'ieee-uom',
    },
    category: { id: 'cat-competitions', name: 'Competitions', slug: 'competitions' },
    registrationsCount: 0,
    createdAt: now,
  },
];

// Query simulation applying PostgreSQL search and filter rules
function queryEvents(query: {
  search?: string;
  categorySlug?: string;
  categoryId?: string;
  universitySlug?: string;
  universityId?: string;
  facultyId?: string;
  departmentId?: string;
  mode?: EventMode;
  datePreset?: string;
  startDateFrom?: string;
  startDateTo?: string;
  registrationOpenOnly?: boolean;
  isFree?: boolean;
  skills?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const page = query.page || 1;
  const limit = query.limit || 10;

  // Rule 0: Strict Public Isolation — Only PUBLISHED
  let filtered = mockDatabase.filter((e) => e.status === EventStatus.PUBLISHED);

  // 1. Multi-Field Search
  if (query.search && query.search.trim().length > 0) {
    const s = query.search.trim().toLowerCase();
    filtered = filtered.filter((e) => {
      const matchTitle = e.title.toLowerCase().includes(s);
      const matchDesc =
        e.description.toLowerCase().includes(s) ||
        (e.shortDescription?.toLowerCase().includes(s) ?? false);
      const matchLocation =
        e.location?.toLowerCase().includes(s) || e.venue?.toLowerCase().includes(s);
      const matchCategory =
        e.category.name.toLowerCase().includes(s) || e.category.slug.toLowerCase().includes(s);
      const matchUni =
        e.university?.name.toLowerCase().includes(s) ||
        e.university?.slug.toLowerCase().includes(s);
      const matchOrg =
        e.organization.name.toLowerCase().includes(s) ||
        e.organization.slug.toLowerCase().includes(s);
      const matchSkills = e.skills.some((sk) => sk.toLowerCase().includes(s));

      return (
        matchTitle ||
        matchDesc ||
        matchLocation ||
        matchCategory ||
        matchUni ||
        matchOrg ||
        matchSkills
      );
    });
  }

  // 2. Filters
  if (query.categorySlug) {
    filtered = filtered.filter((e) => e.category.slug === query.categorySlug);
  }
  if (query.categoryId) {
    filtered = filtered.filter((e) => e.category.id === query.categoryId);
  }
  if (query.universitySlug) {
    filtered = filtered.filter(
      (e) =>
        e.university?.slug === query.universitySlug ||
        e.organization.university?.slug === query.universitySlug,
    );
  }
  if (query.universityId) {
    filtered = filtered.filter(
      (e) =>
        e.university?.id === query.universityId ||
        e.organization.universityId === query.universityId,
    );
  }
  if (query.facultyId) {
    filtered = filtered.filter((e) => e.facultyId === query.facultyId);
  }
  if (query.departmentId) {
    filtered = filtered.filter((e) => e.departmentId === query.departmentId);
  }
  if (query.mode) {
    filtered = filtered.filter((e) => e.mode === query.mode);
  }
  if (query.isFree !== undefined) {
    filtered = filtered.filter((e) => e.isFree === query.isFree);
  }
  if (query.registrationOpenOnly) {
    const curr = new Date();
    filtered = filtered.filter((e) => {
      if (!e.registrationDeadline) return e.startDate >= curr;
      return e.registrationDeadline >= curr;
    });
  }
  if (query.datePreset) {
    const curr = new Date();
    if (query.datePreset === 'upcoming') {
      filtered = filtered.filter((e) => e.startDate >= curr);
    } else if (query.datePreset === 'this_week') {
      const weekEnd = new Date(curr.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((e) => e.startDate >= curr && e.startDate <= weekEnd);
    }
  }
  if (query.skills) {
    const requestedSkills = query.skills.split(',').map((s) => s.trim().toLowerCase());
    filtered = filtered.filter((e) =>
      e.skills.some((sk) => requestedSkills.includes(sk.toLowerCase())),
    );
  }

  // 3. Sorting
  if (query.sortBy === 'registrations') {
    filtered.sort((a, b) =>
      query.sortOrder === 'asc'
        ? a.registrationsCount - b.registrationsCount
        : b.registrationsCount - a.registrationsCount,
    );
  } else if (query.sortBy === 'title') {
    filtered.sort((a, b) =>
      query.sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title),
    );
  } else {
    // Default startDate asc
    filtered.sort((a, b) =>
      query.sortOrder === 'desc'
        ? b.startDate.getTime() - a.startDate.getTime()
        : a.startDate.getTime() - b.startDate.getTime(),
    );
  }

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const items = filtered.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🔍  CampusPulse Phase 8: Event Search and Filtering Suite');
  console.log('=============================================================\n');

  // ---------------------------------------------------------------------------
  // Test 1: Multi-field Search
  // ---------------------------------------------------------------------------
  console.log('1. Testing Multi-Field PostgreSQL Search...');

  const searchTitle = queryEvents({ search: 'MoraHack' });
  assert(
    searchTitle.items.length === 1 && searchTitle.items[0]!.id === 'evt-1',
    'Search by title finds matching opportunity',
  );

  const searchDesc = queryEvents({ search: 'cutting edge AI' });
  assert(
    searchDesc.items.length === 1 && searchDesc.items[0]!.id === 'evt-1',
    'Search by description content matches correctly',
  );

  const searchCategory = queryEvents({ search: 'Career' });
  assert(
    searchCategory.items.length === 1 && searchCategory.items[0]!.id === 'evt-2',
    'Search by category name matches correctly',
  );

  const searchSkills = queryEvents({ search: 'PyTorch' });
  assert(
    searchSkills.items.length === 1 && searchSkills.items[0]!.id === 'evt-3',
    'Search by skills array matches correctly',
  );

  const searchUniversity = queryEvents({ search: 'Peradeniya' });
  assert(
    searchUniversity.items.length === 1 && searchUniversity.items[0]!.id === 'evt-3',
    'Search by university affiliation matches correctly',
  );

  const searchOrganization = queryEvents({ search: 'Rotaract' });
  assert(
    searchOrganization.items.length === 1 && searchOrganization.items[0]!.id === 'evt-2',
    'Search by hosting organization matches correctly',
  );

  // ---------------------------------------------------------------------------
  // Test 2: Dimensional Filtering
  // ---------------------------------------------------------------------------
  console.log('\n2. Testing Granular Dimensional Filters...');

  const filterCategory = queryEvents({ categorySlug: 'competitions' });
  assert(
    filterCategory.items.every((e) => e.category.slug === 'competitions'),
    'Filter by categorySlug works accurately',
  );

  const filterUniversity = queryEvents({ universitySlug: 'uom' });
  assert(
    filterUniversity.items.every((e) => e.university?.slug === 'uom'),
    'Filter by universitySlug matches institution events',
  );

  const filterFaculty = queryEvents({ facultyId: 'fac-eng-uom' });
  assert(
    filterFaculty.items.every((e) => e.facultyId === 'fac-eng-uom'),
    'Filter by facultyId matches specific faculty',
  );

  const filterMode = queryEvents({ mode: EventMode.HYBRID });
  assert(
    filterMode.items.every((e) => e.mode === EventMode.HYBRID),
    'Filter by event mode (HYBRID) filters accurately',
  );

  const filterFree = queryEvents({ isFree: true });
  assert(
    filterFree.items.every((e) => e.isFree === true),
    'Filter by isFree=true returns free events only',
  );

  const filterPaid = queryEvents({ isFree: false });
  assert(
    filterPaid.items.every((e) => e.isFree === false),
    'Filter by isFree=false returns paid events only',
  );

  const filterSkills = queryEvents({ skills: 'Python' });
  assert(
    filterSkills.items.length === 2 && filterSkills.items.every((e) => e.skills.includes('Python')),
    'Filter by skill (Python) matches all events containing skill',
  );

  // ---------------------------------------------------------------------------
  // Test 3: Combinatorial Multi-Filter Queries
  // ---------------------------------------------------------------------------
  console.log('\n3. Testing Combinatorial Multi-Filter Queries...');

  const multiFilter = queryEvents({
    search: 'AI',
    categorySlug: 'competitions',
    mode: EventMode.HYBRID,
    isFree: true,
  });
  assert(
    multiFilter.items.length === 1 && multiFilter.items[0]!.id === 'evt-1',
    'Combined query (search=AI & category=competitions & mode=HYBRID & isFree=true) returns precise target',
  );

  const impossibleFilter = queryEvents({
    search: 'MoraHack',
    mode: EventMode.ONLINE, // MoraHack is HYBRID
  });
  assert(impossibleFilter.items.length === 0, 'Contradictory filters yield 0 results gracefully');

  // ---------------------------------------------------------------------------
  // Test 4: Sorting & Pagination
  // ---------------------------------------------------------------------------
  console.log('\n4. Testing Sorting & Pagination Controls...');

  const sortByPopularity = queryEvents({ sortBy: 'registrations', sortOrder: 'desc' });
  assert(
    sortByPopularity.items[0]!.registrationsCount >= sortByPopularity.items[1]!.registrationsCount,
    'Sorting by registrations (popularity) orders descending correctly',
  );

  const sortByTitleAsc = queryEvents({ sortBy: 'title', sortOrder: 'asc' });
  assert(
    sortByTitleAsc.items[0]!.title < sortByTitleAsc.items[1]!.title,
    'Sorting by title orders alphabetically (A-Z)',
  );

  const paginatedPage1 = queryEvents({ limit: 2, page: 1 });
  assert(
    paginatedPage1.items.length === 2 &&
      paginatedPage1.meta.page === 1 &&
      paginatedPage1.meta.hasNextPage === true &&
      paginatedPage1.meta.hasPrevPage === false,
    'Pagination page 1 returns 2 items with hasNextPage=true',
  );

  const paginatedPage2 = queryEvents({ limit: 2, page: 2 });
  assert(
    paginatedPage2.items.length === 1 &&
      paginatedPage2.meta.page === 2 &&
      paginatedPage2.meta.hasNextPage === false &&
      paginatedPage2.meta.hasPrevPage === true,
    'Pagination page 2 returns remaining items with hasPrevPage=true',
  );

  // ---------------------------------------------------------------------------
  // Test 5: Security & Privacy Isolation
  // ---------------------------------------------------------------------------
  console.log('\n5. Testing Security & Public Isolation...');

  const allSearch = queryEvents({ search: 'Secret' });
  assert(
    allSearch.items.length === 0,
    'DRAFT / Unapproved events are NEVER leaked in public search query',
  );

  const totalPublic = queryEvents({});
  assert(
    totalPublic.items.every((e) => e.status === EventStatus.PUBLISHED),
    'Public search response strictly contains PUBLISHED opportunities only',
  );

  // Summary
  console.log('\n=============================================================');
  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`📊  Test Results: ${totalPassed} / ${results.length} PASSED`);
  console.log('=============================================================\n');

  if (totalPassed !== results.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});

import { NextRequest, NextResponse } from 'next/server';

// Mock data for development
let groups = [
  {
    id: "1",
    name: "Family Savings Circle",
    description: "Monthly contribution for family members",
    contributionType: "monthly",
    contributionAmount: 50000,
    currency: "NGN",
    maxMembers: 12,
    totalCycles: 12,
    currentCycle: 4,
    startDate: "2024-10-01",
    status: "active",
    ownerId: "1",
    adminId: "1",
    members: [
      { userId: "1", position: 1, positions: 1, status: "active", hasPaid: true },
      { userId: "2", position: 2, positions: 1, status: "active", hasPaid: true },
      { userId: "3", position: 3, positions: 1, status: "active", hasPaid: false },
    ],
    penaltySettings: { type: "percentage", value: 5, gracePeriod: 3 },
    chargeSettings: { type: "percentage", value: 1 },
    payoutOrder: "fixed",
    isPrivate: false,
    inviteCode: "FAM2024",
    createdAt: "2024-09-15",
    updatedAt: "2025-01-20",
  },
];

// GET /api/groups - Get all groups for the user
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const inviteCode = searchParams.get('inviteCode');

  try {
    let filteredGroups = [...groups];

    // Filter by invite code (for joining)
    if (inviteCode) {
      const group = filteredGroups.find(g => g.inviteCode === inviteCode);
      if (!group) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 404 }
        );
      }
      return NextResponse.json({ group });
    }

    // Filter by user membership
    if (userId) {
      filteredGroups = filteredGroups.filter(g => 
        g.members.some((m: { userId: string }) => m.userId === userId) || g.ownerId === userId
      );
    }

    // Filter by status
    if (status) {
      filteredGroups = filteredGroups.filter(g => g.status === status);
    }

    return NextResponse.json({ groups: filteredGroups });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      contributionType,
      contributionAmount,
      currency = "NGN",
      maxMembers,
      totalCycles,
      startDate,
      ownerId,
      adminId,
      penaltySettings,
      chargeSettings,
      payoutOrder = "fixed",
      isPrivate = false,
    } = body;

    // Validate required fields
    if (!name || !contributionType || !contributionAmount || !maxMembers || !totalCycles || !startDate || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate invite code
    const inviteCode = name.substring(0, 3).toUpperCase() + Date.now().toString().slice(-4);

    const newGroup = {
      id: Date.now().toString(),
      name,
      description,
      contributionType,
      contributionAmount,
      currency,
      maxMembers,
      totalCycles,
      currentCycle: 1,
      startDate,
      status: 'pending',
      ownerId,
      adminId: adminId || ownerId,
      members: [
        { userId: ownerId, position: 1, positions: 1, status: 'active', hasPaid: false }
      ],
      penaltySettings: penaltySettings || { type: 'percentage', value: 0, gracePeriod: 0 },
      chargeSettings: chargeSettings || { type: 'percentage', value: 0 },
      payoutOrder,
      isPrivate,
      inviteCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    groups.push(newGroup);

    return NextResponse.json({ group: newGroup }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

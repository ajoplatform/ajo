import { NextRequest, NextResponse } from 'next/server';

// Mock data for development
let contributions = [
  {
    id: "1",
    groupId: "1",
    cycleId: "1",
    userId: "1",
    memberPosition: 1,
    amount: 50000,
    expectedDate: "2025-01-25",
    paidDate: "2025-01-20",
    status: "confirmed",
    proofs: [],
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    groupId: "1",
    cycleId: "2",
    userId: "1",
    memberPosition: 1,
    amount: 50000,
    expectedDate: "2025-02-25",
    status: "pending",
    proofs: [],
    createdAt: "2025-01-15",
  },
];

// GET /api/contributions - Get contributions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const groupId = searchParams.get('groupId');
  const status = searchParams.get('status');
  const cycleId = searchParams.get('cycleId');

  try {
    let filteredContributions = [...contributions];

    if (userId) {
      filteredContributions = filteredContributions.filter(c => c.userId === userId);
    }

    if (groupId) {
      filteredContributions = filteredContributions.filter(c => c.groupId === groupId);
    }

    if (status) {
      filteredContributions = filteredContributions.filter(c => c.status === status);
    }

    if (cycleId) {
      filteredContributions = filteredContributions.filter(c => c.cycleId === cycleId);
    }

    return NextResponse.json({ contributions: filteredContributions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

// POST /api/contributions - Create a new contribution (with proof upload)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      groupId,
      cycleId,
      userId,
      memberPosition,
      amount,
      expectedDate,
      proofImage,
      referenceNumber,
      notes,
    } = body;

    // Validate required fields
    if (!groupId || !cycleId || !userId || !memberPosition || !amount || !expectedDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newContribution = {
      id: Date.now().toString(),
      groupId,
      cycleId,
      userId,
      memberPosition,
      amount,
      expectedDate,
      status: 'processing',
      proofs: proofImage ? [
        {
          image: proofImage,
          referenceNumber,
          notes,
          uploadedAt: new Date().toISOString(),
          status: 'pending',
        }
      ] : [],
      createdAt: new Date().toISOString(),
    };

    contributions.push(newContribution);

    return NextResponse.json({ contribution: newContribution }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
}

// PATCH /api/contributions - Update contribution status (admin action)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { contributionId, status, reviewedBy, reviewNotes } = body;

    const contributionIndex = contributions.findIndex(c => c.id === contributionId);
    
    if (contributionIndex === -1) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const contribution = contributions[contributionIndex];
    
    contributions[contributionIndex] = {
      ...contribution,
      status,
      paidDate: status === 'confirmed' ? new Date().toISOString() : contribution.paidDate,
      proofs: contribution.proofs.map((p: { status?: string; reviewedAt?: string; reviewedBy?: string; reviewNotes?: string }) => ({
        ...p,
        status: status === 'confirmed' ? 'approved' : p.status,
        reviewedAt: new Date().toISOString(),
        reviewedBy,
        reviewNotes,
      })),
    };

    return NextResponse.json({ contribution: contributions[contributionIndex] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update contribution' },
      { status: 500 }
    );
  }
}

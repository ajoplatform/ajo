import { NextRequest, NextResponse } from 'next/server';

// Mock data for development
let users = [
  {
    id: "1",
    email: "adaeze@example.com",
    phone: "+234 801 234 5678",
    name: "Adaeze Okonkwo",
    role: "member",
    isActive: true,
    bankDetails: {
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "Adaeze Okonkwo",
    },
    createdAt: "2024-01-15",
    updatedAt: "2025-01-20",
  },
  {
    id: "2",
    email: "chinedu@example.com",
    phone: "+234 802 345 6789",
    name: "Chinedu Eze",
    role: "member",
    isActive: true,
    bankDetails: {
      bankName: "Access Bank",
      accountNumber: "9876543210",
      accountName: "Chinedu Eze",
    },
    createdAt: "2024-02-20",
    updatedAt: "2025-01-15",
  },
];

// GET /api/users - Get user(s)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  try {
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ user });
    }

    if (email) {
      const user = users.find(u => u.email === email);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ user });
    }

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, name, password, bankDetails } = body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      phone,
      name,
      role: 'member',
      isActive: true,
      bankDetails: bankDetails || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ user: users[userIndex] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

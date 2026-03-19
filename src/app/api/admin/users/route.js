import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import mongooseConnect from '@/lib/mongooseConnect';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await mongooseConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        ...user,
        _id: user._id.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

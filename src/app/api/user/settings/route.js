import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect';
import User from '@/models/User';
import { getStoreKey, withStoreScope, withStoreScopeForCreate } from '@/lib/store-scope';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await mongooseConnect();
    const user = await User.findOne(withStoreScope({ email: session.user.email })).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!session.user.isSuperAdmin && user.storeKey !== getStoreKey()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      city: user.city || '',
      address: user.address || '',
      landmark: user.landmark || '',
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, city, address, landmark } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await mongooseConnect();
    const user = await User.findOneAndUpdate(
      withStoreScope({ email: session.user.email }),
      {
        $set: { 
          name, 
          phone, 
          city, 
          address,
          landmark,
          storeKey: getStoreKey(),
        },
        $setOnInsert: withStoreScopeForCreate({
          email: session.user.email,
          name,
        }),
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      name: user.name,
      phone: user.phone,
      city: user.city,
      address: user.address,
      landmark: user.landmark,
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

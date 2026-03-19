import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import mongooseConnect from '@/lib/mongooseConnect';
import Settings from '@/models/Settings';

const SINGLETON_KEY = 'site-settings';

// GET settings — Public (used across the site)
export async function GET() {
    try {
        await mongooseConnect();

        // Find or create the singleton settings document
        let settings = await Settings.findOne({ singletonKey: SINGLETON_KEY }).lean();

        if (!settings) {
            settings = await Settings.create({ singletonKey: SINGLETON_KEY });
            settings = settings.toObject();
        }

        // Clean up internal fields
        settings._id = settings._id.toString();

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT update settings — Admin only
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminEmail(session.user?.email)) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await mongooseConnect();

        const body = await req.json();

        // Only allow whitelisted fields
        const allowedFields = [
            'storeName',
            'supportEmail',
            'businessAddress',
            'whatsappNumber',
            'karachiDeliveryFee',
            'outsideKarachiDeliveryFee',
            'freeShippingThreshold',
            'announcementBarEnabled',
            'announcementBarText',
        ];

        const updates = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updates[key] = body[key];
            }
        }

        const settings = await Settings.findOneAndUpdate(
            { singletonKey: SINGLETON_KEY },
            { $set: updates },
            { new: true, upsert: true, runValidators: true }
        ).lean();

        settings._id = settings._id.toString();
        revalidateTag('settings', 'max');

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// @ts-nocheck
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import mongooseConnect from '@/lib/mongooseConnect';
import Settings from '@/models/Settings';
import { getStoreConfig } from '@/lib/store-config';
import { getStoreKey } from '@/lib/store-scope';

const SINGLETON_KEY = 'site-settings';

function getScopedSettingsKey() {
    return `${getStoreKey()}:${SINGLETON_KEY}`;
}

function normalizeAnnouncementMessages(messages = [], fallbackText = '') {
    const rawMessages = Array.isArray(messages) && messages.length > 0
        ? messages
        : String(fallbackText || '')
            .split(/\r?\n|[|•]+/)
            .map((text) => ({ text }))
            .filter((entry) => String(entry?.text || '').trim());

    return rawMessages
        .map((entry, index) => ({
            id: String(entry?.id || `announcement-${index + 1}`).trim(),
            text: String(entry?.text || '').trim(),
            isActive: entry?.isActive !== false,
        }))
        .filter((entry) => entry.text);
}

// GET settings — Public (used across the site)
export async function GET() {
    try {
        await mongooseConnect();
        const store = getStoreConfig();

        // Find or create the singleton settings document atomically
        const settings = await Settings.findOneAndUpdate(
            { singletonKey: getScopedSettingsKey() },
            {
                $set: {
                    storeKey: getStoreKey(),
                },
                $setOnInsert: {
                    singletonKey: getScopedSettingsKey(),
                },
            },
            { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
        ).lean();

        // Clean up internal fields
        settings._id = settings._id.toString();

        return NextResponse.json({
            success: true,
            data: {
                _id: settings._id,
                storeName: store.name,
                supportEmail: settings.supportEmail || '',
                businessAddress: settings.businessAddress || '',
                whatsappNumber: settings.whatsappNumber || '',
                facebookPageUrl: settings.facebookPageUrl || '',
                instagramUrl: settings.instagramUrl || '',
                trackingEnabled: settings.trackingEnabled === true,
                facebookPixelId: settings.facebookPixelId || '',
                tiktokPixelId: settings.tiktokPixelId || '',
                karachiDeliveryFee: Number(settings.karachiDeliveryFee || 0),
                outsideKarachiDeliveryFee: Number(settings.outsideKarachiDeliveryFee || 0),
                freeShippingThreshold: Number(settings.freeShippingThreshold || 5000),
                announcementBarEnabled: settings.announcementBarEnabled ?? true,
                announcementBarText: settings.announcementBarText || '',
                announcementBarMessages: normalizeAnnouncementMessages(
                    settings.announcementBarMessages,
                    settings.announcementBarText
                ),
                homepageSectionOrder: Array.isArray(settings.homepageSectionOrder) ? settings.homepageSectionOrder : [],
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT update settings — Admin only
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.isAdmin) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await mongooseConnect();

        const body = await req.json();

        // Only allow whitelisted fields
        const allowedFields = [
            'supportEmail',
            'businessAddress',
            'whatsappNumber',
            'facebookPageUrl',
            'instagramUrl',
            'trackingEnabled',
            'facebookPixelId',
            'facebookConversionsApiToken',
            'facebookTestEventCode',
            'tiktokPixelId',
            'tiktokAccessToken',
            'karachiDeliveryFee',
            'outsideKarachiDeliveryFee',
            'freeShippingThreshold',
            'announcementBarEnabled',
            'announcementBarText',
            'announcementBarMessages',
            'homepageSectionOrder',
        ];

        const updates = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updates[key] =
                    key === 'announcementBarMessages'
                        ? normalizeAnnouncementMessages(body[key], body.announcementBarText)
                        : body[key];
            }
        }

        const settings = await Settings.findOneAndUpdate(
            { singletonKey: getScopedSettingsKey() },
            {
                $set: {
                    ...updates,
                    storeKey: getStoreKey(),
                },
                $setOnInsert: {
                    singletonKey: getScopedSettingsKey(),
                },
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        ).lean();

        settings._id = settings._id.toString();
        revalidateTag('settings', 'max');
        revalidateTag('home-sections');
        revalidatePath('/');

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


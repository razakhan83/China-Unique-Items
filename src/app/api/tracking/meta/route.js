import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { sendMetaCustomTrackingEvent } from '@/lib/trackingServer';

export async function POST(request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const result = await sendMetaCustomTrackingEvent({
      eventName: String(body?.eventName || '').trim(),
      eventId: String(body?.eventId || '').trim() || undefined,
      eventSourceUrl: String(body?.eventSourceUrl || '').trim() || request.headers.get('referer') || undefined,
      userData: {
        email: session?.user?.email || body?.userData?.email,
        phone: body?.userData?.phone,
        externalId: body?.userData?.externalId,
      },
      customData: body?.customData && typeof body.customData === 'object' ? body.customData : undefined,
    });

    return NextResponse.json({ success: result.success, skipped: result.skipped === true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

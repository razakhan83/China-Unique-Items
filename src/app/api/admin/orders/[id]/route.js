import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';
import mongooseConnect from '@/lib/mongooseConnect';
import Order from '@/models/Order';

export async function PATCH(req, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    
    const { status, courierName, trackingNumber, weight, manualCodAmount } = body;

    await mongooseConnect();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (status) order.status = status;
    if (courierName !== undefined) order.courierName = courierName;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (weight !== undefined) order.weight = weight;
    if (manualCodAmount !== undefined) {
      if (manualCodAmount === '' || manualCodAmount === null) {
        order.manualCodAmount = undefined;
      } else {
        order.manualCodAmount = Number(manualCodAmount);
      }
    }

    await order.save();

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

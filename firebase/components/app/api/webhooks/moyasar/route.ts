
import { NextResponse } from 'next/server';

/**
 * @fileOverview DEPRECATED Moyasar Webhook. 
 * Replaced by Tap Payments Webhook in /api/webhooks/tap.
 */

export async function POST(req: Request) {
  return NextResponse.json({ message: "Moyasar integration is no longer active. Please use /api/webhooks/tap" }, { status: 410 });
}

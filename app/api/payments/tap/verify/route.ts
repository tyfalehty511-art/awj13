import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار API مؤمن للتحقق من حالة الدفع.
 * يمنع الوصول غير المصرح به ويتحقق من سلامة العملية.
 */

export async function GET(req: Request) {
  try {
    // حماية المسار
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tap_id = searchParams.get('tap_id');

    if (!tap_id) {
      return NextResponse.json({ error: 'رقم العملية مفقود' }, { status: 400 });
    }

    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Secret Key missing' }, { status: 500 });
    }

    const response = await fetch(`https://api.tap.company/v2/charges/${tap_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('فشل التحقق من العملية من قبل البنك');
    }

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

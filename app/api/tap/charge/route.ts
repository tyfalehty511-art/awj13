import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار API لإنشاء طلب دفع (Charge) عبر Tap Payments.
 * يدعم العملة الريال السعودي (SAR) ويتطلب مصادقة المستخدم.
 */

export async function POST(req: Request) {
  try {
    // 1. التحقق من هوية المستخدم (Authentication Check)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لإتمام عملية الشراء' },
        { status: 401 }
      );
    }

    // 2. استلام البيانات من جسم الطلب
    const body = await req.json();
    const { amount, customer, orderId, storeId } = body;

    // 3. التحقق من وجود المفتاح السري في السيرفر
    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) {
      console.error('Missing TAP_SECRET_KEY in environment variables');
      return NextResponse.json(
        { error: 'إعدادات بوابة الدفع غير مكتملة على السيرفر' },
        { status: 500 }
      );
    }

    // 4. إعداد روابط التوجيه
    const baseUrl = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'http://localhost:9002';
    const callbackUrl = `${baseUrl}/payment/tap-callback`;

    // 5. التواصل مع API شركة Tap
    const tapResponse = await fetch('https://api.tap.company/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'SAR',
        threeDSecure: true,
        save_card: false,
        description: `طلب شراء من منصة أوج - رقم #${orderId?.slice(-6)}`,
        metadata: {
          order_id: orderId,
          store_id: storeId,
          type: 'product_purchase'
        },
        customer: {
          first_name: customer.name.split(' ')[0] || 'Customer',
          last_name: customer.name.split(' ').slice(1).join(' ') || 'User',
          email: customer.email,
          phone: {
            country_code: '966',
            number: customer.phone.replace(/^(00966|966|0)/, '')
          }
        },
        source: { id: 'src_all' },
        redirect: {
          url: callbackUrl
        }
      })
    });

    const data = await tapResponse.json();

    // 6. معالجة الاستجابة
    if (!tapResponse.ok) {
      const errorMessage = data.errors?.[0]?.description || 'فشل إنشاء طلب الدفع في Tap';
      return NextResponse.json({ error: errorMessage }, { status: tapResponse.status });
    }

    // إرجاع رابط العملية للواجهة الأمامية
    return NextResponse.json({ url: data.transaction.url });

  } catch (error: any) {
    console.error('Tap API Route Error:', error.message);
    return NextResponse.json(
      { error: 'حدث خطأ تقني أثناء الاتصال ببوابة الدفع' },
      { status: 500 }
    );
  }
}

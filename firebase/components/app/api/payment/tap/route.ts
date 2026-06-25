import { NextResponse } from 'next/server';

/**
 * @fileOverview مسار API لإنشاء طلب دفع عبر بوابة Tap Payments.
 * يستقبل المبلغ وبيانات العميل ويعيد رابط صفحة الدفع.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, name, email } = body;

    // التحقق من وجود المفتاح السري
    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'إعدادات الدفع (TAP_SECRET_KEY) غير موجودة في ملفات البيئة.' },
        { status: 500 }
      );
    }

    // بناء طلب الدفع لشركة Tap
    const response = await fetch('https://api.tap.company/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: "SAR",
        threeDSecure: true,
        save_card: false,
        description: `طلب شراء من منصة أوج للعميل: ${name}`,
        customer: {
          first_name: name,
          email: email
        },
        source: { id: "src_all" },
        redirect: { 
          // ملاحظة: يمكنك تغيير هذا الرابط ليكون ديناميكياً بناءً على النطاق الحالي
          url: "http://localhost:3000/payment-status" 
        }
      })
    });

    const data = await response.json();

    // معالجة استجابة Tap
    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.description || 'حدث خطأ أثناء التواصل مع بوابة Tap';
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    // إرجاع رابط المعاملة للواجهة الأمامية
    return NextResponse.json({ 
      url: data.transaction.url,
      id: data.id 
    });

  } catch (error: any) {
    console.error('Tap Payment API Error:', error.message);
    return NextResponse.json(
      { error: 'فشل النظام في إنشاء طلب الدفع. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}

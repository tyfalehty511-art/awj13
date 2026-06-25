
import { NextResponse } from 'next/server';

/**
 * @fileOverview API route to create a Tap Payment Charge for both Product Orders and Domain Requests.
 */

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, customer, orderId, storeId } = body;

    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Tap configuration error' }, { status: 500 });
    }

    // Identify if it's a domain request based on context or specific flags if needed
    // For now we use the general flow, but metadata will help the webhook distinguish
    const isDomainRequest = storeId && orderId && !storeId.startsWith('store_'); 
    
    const baseUrl = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'http://localhost:9002';
    const callbackUrl = `${baseUrl}/payment/tap-callback`;

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
        description: `Order #${orderId?.slice(-6)} on Awj Platform`,
        metadata: {
          order_id: orderId,
          store_id: storeId,
          type: orderId.length > 20 ? 'product_purchase' : 'domain_purchase' // Simplistic check, refined by metadata structure
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

    if (!tapResponse.ok) {
      const errorMessage = data.errors?.[0]?.description || 'Failed to create payment session';
      return NextResponse.json({ error: errorMessage }, { status: tapResponse.status });
    }

    return NextResponse.json({ url: data.transaction.url });

  } catch (error: any) {
    console.error('Tap Charge Error:', error.message);
    return NextResponse.json({ error: 'Internal system error' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe-server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret || '');
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const { firestore: db } = initializeFirebase();

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { type, storeId, orderId, requestId, amount } = paymentIntent.metadata;
    const totalAmount = Number(amount);

    if (type === 'product_order' && storeId && orderId) {
      // Awj Logic: 9% Commission on ALL product sales
      const platformFeePercent = 9;
      const commission = totalAmount * (platformFeePercent / 100);
      const merchantBalance = totalAmount - commission;

      const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.exists() ? orderSnap.data() : null;
      
      // Auto-complete logic for digital assets
      const itemsWithDeliveryInfo = orderData?.items?.map((item: any) => {
        // Here we ensure delivery info is baked into the order snapshot if it's not already there
        // This ensures the success page has everything it needs.
        return {
          ...item,
          deliveredAt: serverTimestamp(),
          deliveryStatus: 'success'
        };
      });

      const isAutoCompletable = orderData?.items?.every((item: any) => 
        ['digital', 'voucher', 'service'].includes(item.type)
      );

      await updateDoc(orderRef, {
        status: isAutoCompletable ? 'completed' : 'paid',
        items: itemsWithDeliveryInfo || orderData?.items,
        awj_commission: commission,
        merchant_balance: merchantBalance,
        platform_fee_percent: platformFeePercent,
        payment_id: paymentIntent.id,
        transaction_type: 'PRODUCT_SALE',
        updatedAt: serverTimestamp()
      });

      // Ledger Recording for Analytics
      const transRef = collection(db, 'stores', storeId, 'transactions');
      await addDoc(transRef, {
        order_id: orderId,
        store_id: storeId,
        total_amount: totalAmount,
        awj_commission: commission,
        merchant_balance: merchantBalance,
        platform_fee_percent: platformFeePercent,
        transaction_type: 'PRODUCT_SALE',
        payment_id: paymentIntent.id,
        createdAt: serverTimestamp()
      });
    }

    if (type === 'domain_request' && requestId) {
      const domainRef = doc(db, 'domain_requests', requestId);
      await updateDoc(domainRef, {
        status: 'paid',
        payment_id: paymentIntent.id,
        updatedAt: serverTimestamp()
      });

      const domainSnap = await getDoc(domainRef);
      const domainStoreId = domainSnap.exists() ? domainSnap.data().store_id : 'unknown';

      const transRef = collection(db, 'stores', domainStoreId, 'transactions');
      await addDoc(transRef, {
        request_id: requestId,
        store_id: domainStoreId,
        total_amount: totalAmount,
        awj_commission: totalAmount,
        merchant_balance: 0,
        transaction_type: 'SERVICE_PURCHASE',
        payment_id: paymentIntent.id,
        createdAt: serverTimestamp()
      });
    }
  }

  return NextResponse.json({ received: true });
}

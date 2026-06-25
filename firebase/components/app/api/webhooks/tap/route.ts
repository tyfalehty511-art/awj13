
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

/**
 * @fileOverview Webhook handler for Tap Payments.
 * Manages successful payment updates for Product Orders and Domain Requests.
 */

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { id: chargeId, status, metadata, amount } = payload;

    // Tap Webhooks send full charge object
    if (status !== 'CAPTURED') {
      return NextResponse.json({ message: 'Ignore non-captured events' });
    }

    const { firestore: db } = initializeFirebase();
    const { type, order_id, store_id } = metadata;

    if (type === 'product_purchase' && order_id && store_id) {
      const orderRef = doc(db, 'stores', store_id, 'orders', order_id);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        const platformFeePercent = 9;
        const totalAmount = Number(amount);
        const commission = totalAmount * (platformFeePercent / 100);
        const merchantBalance = totalAmount - commission;

        await updateDoc(orderRef, {
          status: 'paid',
          payment_id: chargeId,
          awj_commission: commission,
          merchant_balance: merchantBalance,
          updatedAt: serverTimestamp()
        });

        // Record Ledger Transaction
        await addDoc(collection(db, 'stores', store_id, 'transactions'), {
          order_id,
          store_id,
          total_amount: totalAmount,
          awj_commission: commission,
          merchant_balance: merchantBalance,
          transaction_type: 'PRODUCT_SALE',
          payment_id: chargeId,
          createdAt: serverTimestamp()
        });
      }
    }

    if (type === 'domain_purchase' && order_id) {
      const domainRef = doc(db, 'domain_requests', order_id);
      await updateDoc(domainRef, {
        status: 'paid',
        payment_id: chargeId,
        updatedAt: serverTimestamp()
      });

      // Record Global Platform Ledger
      await addDoc(collection(db, 'stores', store_id, 'transactions'), {
        request_id: order_id,
        store_id,
        total_amount: Number(amount),
        transaction_type: 'DOMAIN_PURCHASE',
        payment_id: chargeId,
        createdAt: serverTimestamp()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Tap Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

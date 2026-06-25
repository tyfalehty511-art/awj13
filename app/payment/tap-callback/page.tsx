'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useAuth } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

function TapCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string | null>(null);

  const tap_id = searchParams.get('tap_id');

  useEffect(() => {
    async function handleVerification() {
      if (!tap_id || !db) return;

      try {
        // جلب التوكن للتحقق الآمن
        const user = auth.currentUser;
        const idToken = user ? await user.getIdToken() : '';

        // 1. التحقق من حالة الدفع عبر السيرفر مع تمرير التوكن
        const response = await fetch(`/api/payments/tap/verify?tap_id=${tap_id}`, {
          headers: {
            'Authorization': idToken ? `Bearer ${idToken}` : ''
          }
        });
        
        const chargeData = await response.json();

        if (response.ok && chargeData.status === 'CAPTURED') {
          const { order_id, store_id } = chargeData.metadata;

          // 2. تحديث Firestore إلى حالة مدفوع (Paid)
          const orderRef = doc(db, 'stores', store_id, 'orders', order_id);
          await updateDoc(orderRef, {
            status: 'paid',
            payment_id: tap_id,
            tap_status: 'CAPTURED',
            updatedAt: serverTimestamp()
          });

          setStatus('success');
          
          // 3. التوجيه لصفحة النجاح النهائية بعد تأخير بسيط
          setTimeout(() => {
            router.push(`/payment/success?orderId=${order_id}&storeId=${store_id}`);
          }, 2000);
        } else {
          setStatus('failed');
          setError(chargeData.error || chargeData.response?.message || 'لم تكتمل عملية الدفع بنجاح.');
        }
      } catch (err: any) {
        console.error('Verification Error:', err);
        setStatus('failed');
        setError('حدث خطأ أثناء معالجة بيانات الدفع أو التحقق من الهوية.');
      }
    }

    handleVerification();
  }, [tap_id, db, router, auth]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-8 font-body" dir="rtl">
      {status === 'verifying' && (
        <div className="space-y-6 animate-pulse">
           <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <ShieldCheck className="absolute inset-0 m-auto h-8 w-8 text-primary" />
           </div>
           <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">جاري التحقق من عملية الدفع...</h1>
              <p className="text-gray-500">يرجى عدم إغلاق الصفحة، يتم تأمين طلبك الآن.</p>
           </div>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-12 w-12" />
           </div>
           <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">تم تأكيد الدفع!</h1>
              <p className="text-green-600 font-medium">شكراً لك، جاري نقلك لصفحة تحميل المنتج...</p>
           </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="h-12 w-12" />
           </div>
           <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">عذراً، فشل الدفع</h1>
              <p className="text-red-500 font-medium max-w-sm mx-auto">{error}</p>
           </div>
           <Button onClick={() => router.back()} className="bg-primary px-8 h-14 rounded-2xl font-bold shadow-lg shadow-primary/20">
              العودة والمحاولة مرة أخرى
           </Button>
        </div>
      )}
    </div>
  );
}

export default function TapCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <TapCallbackContent />
    </Suspense>
  );
}

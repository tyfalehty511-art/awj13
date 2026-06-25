'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useAuth } from '@/firebase';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight, 
  LayoutDashboard,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const tap_id = searchParams.get('tap_id');

  useEffect(() => {
    async function verifyAndUpdate() {
      if (!tap_id || !db) return;

      try {
        const user = auth.currentUser;
        const idToken = user ? await user.getIdToken() : '';

        // 1. التحقق من العملية عبر السيرفر
        const response = await fetch(`/api/payments/tap/verify?tap_id=${tap_id}`, {
          headers: {
            'Authorization': idToken ? `Bearer ${idToken}` : ''
          }
        });
        
        const data = await response.json();

        if (response.ok && data.status === 'CAPTURED') {
          setTransactionData(data);
          
          // 2. تحديد المسار للتحديث (اشتراك مستخدم أو طلب في متجر)
          const { type, order_id, store_id, user_uid } = data.metadata || {};
          
          if (user) {
            // تحديث حالة العميل/الاشتراك في مستند المستخدم
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              subscription_status: 'active',
              last_payment_id: tap_id,
              last_payment_date: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });

            // إذا كان الدفع مرتبط بطلب محدد في متجر
            if (order_id && store_id) {
              const orderRef = doc(db, 'stores', store_id, 'orders', order_id);
              await updateDoc(orderRef, {
                status: 'paid',
                payment_id: tap_id,
                updatedAt: serverTimestamp()
              });
            }
          }

          setStatus('success');
        } else {
          setStatus('failed');
          setError(data.error || 'عذراً، لم تكتمل عملية الدفع بشكل صحيح من قبل البنك.');
        }
      } catch (err: any) {
        console.error('Verification flow error:', err);
        setStatus('failed');
        setError('حدث خطأ فني أثناء تحديث بيانات الدفع. يرجى التواصل مع الدعم الفني.');
      }
    }

    verifyAndUpdate();
  }, [tap_id, db, auth, router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center font-body" dir="rtl">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {status === 'verifying' && (
          <div className="space-y-6 py-12">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <ShieldCheck className="absolute inset-0 m-auto h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">جاري تأمين دفعتك...</h1>
              <p className="text-gray-500 font-medium">نتحقق الآن من بيانات البنك لتنشيط حسابك فوراً.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <Card className="border-none shadow-2xl shadow-gray-200 rounded-[3rem] overflow-hidden bg-white">
            <CardContent className="p-10 space-y-8">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">تم تفعيل اشتراكك!</h1>
                <p className="text-green-600 font-bold">شكراً لثقتك بمنصة أوج.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-right">
                <div className="flex items-center gap-3 text-gray-400 font-bold text-xs uppercase tracking-widest border-b border-gray-200 pb-3">
                  <Receipt className="h-4 w-4" /> ملخص العملية
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">رقم العملية</span>
                  <span className="font-mono font-bold text-gray-900">#{tap_id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">المبلغ المدفوع</span>
                  <span className="font-bold text-primary">{transactionData?.amount} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">حالة الحساب</span>
                  <Badge className="bg-green-50 text-green-600 border-none font-bold">نشط (Active)</Badge>
                </div>
              </div>

              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 gap-2 transition-all active:scale-95"
              >
                الدخول للوحة التحكم <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'failed' && (
          <Card className="border-none shadow-2xl shadow-gray-200 rounded-[3rem] overflow-hidden bg-white">
            <CardContent className="p-10 space-y-8">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <XCircle className="h-12 w-12" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">عذراً، فشل الدفع</h1>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3 text-right">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-600 text-sm font-medium leading-relaxed">{error}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => router.back()}
                  className="w-full h-14 bg-gray-900 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  المحاولة مرة أخرى
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="w-full h-12 text-gray-400 font-bold"
                >
                  العودة للرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <footer className="pt-4 flex items-center justify-center gap-2 opacity-30">
          <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment Gateway • Tap</span>
        </footer>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-white">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-gray-400 font-bold">جاري تحميل البيانات...</p>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}

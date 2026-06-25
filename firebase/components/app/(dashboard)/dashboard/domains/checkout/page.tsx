
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Globe, 
  CreditCard,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function DomainCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const domain = searchParams.get('domain') || '';
  const total = parseFloat(searchParams.get('price') || '0') || 75; 
  
  const setupFee = 15;
  const annualPrice = total - setupFee;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceedToPayment = async () => {
    if (!user || !db || !domain) return;
    
    setIsProcessing(true);
    try {
      // 1. Create a domain request record in Firestore
      const domainRequestRef = await addDoc(collection(db, 'domain_requests'), {
        requested_domain: domain,
        store_id: user.uid, // Assuming store_id is owner_uid for simplicity in this flow
        owner_uid: user.uid,
        amount: total,
        status: 'pending_payment',
        createdAt: serverTimestamp()
      });

      // 2. Redirect to the central checkout page
      // We pass the type 'domain_request' so the checkout page knows how to handle it
      router.push(`/checkout?type=domain_request&id=${domainRequestRef.id}&storeId=${user.uid}`);
    } catch (error) {
      console.error("Error initiating domain purchase:", error);
      toast({ title: "خطأ", description: "فشل بدء عملية الشراء، يرجى المحاولة لاحقاً.", variant: "destructive" });
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10 font-body" dir="rtl">
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}><ArrowRight className="h-6 w-6" /></Button>
         <h1 className="text-3xl font-bold text-gray-900">إتمام شراء الدومين</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden p-10 flex flex-col items-center justify-center text-center space-y-8">
              <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary">
                 <Globe className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-bold text-gray-900">أنت على وشك حجز {domain}</h2>
                 <p className="text-gray-500 max-w-sm">سيتم نقلك الآن إلى بوابة الدفع الآمنة (Tap) لإتمام العملية وتفعيل الدومين فوراً.</p>
              </div>

              <Button 
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="h-20 px-12 bg-primary hover:bg-primary/90 text-white font-bold text-2xl rounded-[1.5rem] shadow-2xl shadow-primary/20 gap-3 transition-all active:scale-95 group"
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                الانتقال للدفع الآمن
              </Button>

              <div className="flex items-center gap-6 pt-4 grayscale opacity-40">
                 <span className="text-[10px] font-bold uppercase tracking-widest">Mada</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest">Visa</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest">Apple Pay</span>
              </div>
           </Card>

           <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-blue-900">نظام دفع مشفر وآمن</p>
                <p className="text-xs text-blue-700 leading-relaxed">نستخدم تقنيات Tap Payments العالمية لضمان حماية بياناتك البنكية بالكامل وتفعيل الخدمات بشكل فوري.</p>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <Card className="bg-gray-900 text-white rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h3 className="text-xl font-bold flex items-center gap-3 relative z-10 text-primary">
                <Zap className="h-6 w-6" /> ملخص الفاتورة
              </h3>
              
              <div className="space-y-6 relative z-10 border-t border-white/5 pt-6">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">النطاق المطلوب</span>
                    <span className="font-mono text-primary font-bold">{domain}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">السعر السنوي</span>
                    <span className="font-mono">{annualPrice.toLocaleString('ar-SA')} ر.س</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">رسوم الإعداد</span>
                    <span className="font-mono">{setupFee.toLocaleString('ar-SA')} ر.س</span>
                 </div>
                 <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-lg">المجموع</span>
                    <span className="text-4xl font-bold text-green-400 font-mono">{total.toLocaleString('ar-SA')} ر.س</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

export default function DomainCheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-40"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>}>
      <DomainCheckoutContent />
    </Suspense>
  );
}

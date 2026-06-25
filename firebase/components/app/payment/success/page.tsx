
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Download, 
  ArrowRight, 
  Loader2, 
  ExternalLink, 
  CreditCard,
  Mail,
  MessageCircle,
  FileText,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function SuccessContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { toast } = useToast();
  
  const orderId = searchParams.get('orderId');
  const storeId = searchParams.get('storeId');
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId || !storeId || !db) {
        setLoading(false);
        return;
      }
      try {
        const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
        const snap = await getDoc(orderRef);
        if (snap.exists()) {
          setOrder(snap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, storeId, db]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "تم النسخ", description: "تم نسخ الكود إلى الحافظة." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><CheckCircle2 className="h-10 w-10 opacity-20" /></div>
      <h1 className="text-2xl font-bold">عذراً، تعذر العثور على بيانات الطلب</h1>
      <Link href="/"><Button>العودة للمتجر</Button></Link>
    </div>
  );

  const digitalItems = order?.items?.filter((i: any) => i.type === 'digital');
  const voucherItems = order?.items?.filter((i: any) => i.type === 'voucher');
  const serviceItems = order?.items?.filter((i: any) => i.type === 'service');

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center py-20 font-body" dir="rtl">
      <div className="max-w-2xl w-full space-y-12">
        {/* Header Success Animation */}
        <div className="relative inline-block">
           <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-20 rounded-full animate-pulse"></div>
           <div className="w-24 h-24 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center relative z-10 shadow-xl shadow-green-500/20 mx-auto transform hover:scale-110 transition-transform">
              <CheckCircle2 className="h-14 w-14" />
           </div>
        </div>
        
        <div className="space-y-4">
           <h1 className="text-4xl md:text-5xl font-bold text-gray-900">تم الدفع بنجاح!</h1>
           <p className="text-gray-500 text-lg leading-relaxed font-medium max-w-lg mx-auto">
             شكراً لك <span className="text-primary font-bold">{order?.customer_name}</span>. تم تأكيد طلبك رقم <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">#{orderId?.slice(-6).toUpperCase()}</span> بنجاح.
           </p>
        </div>

        <div className="grid gap-6">
          {/* Digital Products (Files) */}
          {digitalItems?.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6 text-right">
               <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                    <Download className="h-6 w-6" /> روابط تحميل الملفات
                  </h3>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">جاهزة الآن</span>
               </div>
               <div className="space-y-4">
                 {digitalItems.map((item: any, idx: number) => (
                   <div key={idx} className="bg-gray-50/50 p-6 rounded-2xl flex items-center justify-between group hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                           <FileText className="h-6 w-6" />
                        </div>
                        <div>
                           <p className="font-bold text-gray-900">{item.title}</p>
                           <p className="text-xs text-gray-400">ملف رقمي آمن</p>
                        </div>
                      </div>
                      <a href={item.file_url} target="_blank" download>
                        <Button className="bg-primary hover:bg-primary/90 font-bold gap-2 rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
                           تحميل الآن <Download className="h-4 w-4" />
                        </Button>
                      </a>
                   </div>
                 ))}
               </div>
               <p className="text-[10px] text-center text-gray-400">ستبقى روابط التحميل متاحة في بريدك الإلكتروني أيضاً.</p>
            </div>
          )}

          {/* Vouchers/Codes */}
          {voucherItems?.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6 text-right">
               <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-orange-500">
                    <CreditCard className="h-6 w-6" /> أكواد البطاقات الرقمية
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Mail className="h-3 w-3" /> تم الإرسال للبريد
                  </div>
               </div>
               <div className="space-y-4">
                 {voucherItems.map((item: any, idx: number) => (
                   <div key={idx} className="bg-gray-50/50 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                           <Smartphone className="h-5 w-5" />
                        </div>
                        <p className="font-bold text-gray-900">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-900 text-primary font-mono px-6 py-4 rounded-xl text-xl font-bold border border-white/10 tracking-widest text-center select-all">
                           {item.voucher_codes?.[0] || 'سيتم إرسال الكود قريباً'}
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-14 w-14 rounded-xl border-gray-200"
                          onClick={() => copyToClipboard(item.voucher_codes?.[0] || '', `v-${idx}`)}
                        >
                          {copiedId === `v-${idx}` ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Digital Services */}
          {serviceItems?.length > 0 && (
            <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-8 space-y-4 text-right">
               <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                 <MessageCircle className="h-6 w-6" /> بخصوص طلب الخدمة
               </h3>
               <div className="space-y-3">
                 <p className="text-gray-700 font-medium leading-relaxed">
                   لقد استلمنا طلبك لـ <span className="font-bold">{serviceItems.map(i => i.title).join('، ')}</span>.
                 </p>
                 <div className="flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-primary/5">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <p className="text-sm text-gray-600">سيقوم صاحب المتجر بالتواصل معك عبر رقم الجوال <span className="font-bold" dir="ltr">{order.customer_phone}</span> أو البريد الإلكتروني لإتمام تنفيذ الخدمة خلال ساعات العمل.</p>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
           <Link href="/" className="flex-1 max-w-xs">
              <Button className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 gap-2">
                 العودة للمتجر <ShoppingBag className="h-5 w-5" />
              </Button>
           </Link>
           <Link href="/dashboard/orders" className="flex-1 max-w-xs">
              <Button variant="outline" className="w-full h-14 border-gray-200 text-gray-600 font-bold rounded-2xl gap-2">
                 تتبع جميع طلباتي <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
           </Link>
        </div>

        <footer className="pt-10">
           <div className="flex items-center justify-center gap-2 grayscale opacity-40 hover:opacity-100 transition-all cursor-default">
             <span className="text-[10px] font-bold text-gray-900 tracking-tighter uppercase">Powered by Awj</span>
           </div>
        </footer>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}

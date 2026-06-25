
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { TapPaymentForm } from '@/components/TapPaymentForm';
import { Loader2, ArrowRight, ShieldCheck, User, Package, Truck, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [customerInfo, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });
  const [showPayment, setShowPayment] = useState(false);

  const type = searchParams.get('type'); // 'product_order' or 'domain_request'
  const id = searchParams.get('id');
  const storeId = searchParams.get('storeId');

  useEffect(() => {
    async function fetchOrder() {
      if (!id || !type || !db) return;
      try {
        let snap;
        if (type === 'domain_request') {
          snap = await getDoc(doc(db, 'domain_requests', id));
        } else {
          snap = await getDoc(doc(db, 'stores', storeId!, 'orders', id));
        }

        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        } else {
          throw new Error("الطلب غير موجود أو قديم");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [type, id, storeId, db]);

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !db) return;

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError("يرجى إكمال البيانات الأساسية للمشتري");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
      };

      if (type === 'domain_request') {
        await updateDoc(doc(db, 'domain_requests', order.id), updateData);
      } else {
        await updateDoc(doc(db, 'stores', storeId!, 'orders', order.id), {
          ...updateData,
          shipping_info: order.is_digital ? null : { city: customerInfo.city, address: customerInfo.address }
        });
      }

      setShowPayment(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (type === 'domain_request') {
      router.push(`/dashboard/domains/success?domain=${order.requested_domain}&amount=${order.amount}`);
    } else {
      router.push(`/payment/success?orderId=${order.id}&storeId=${storeId}`);
    }
  };

  if (loading && !showPayment) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-white">
      <div className="relative">
         <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
         <ShieldCheck className="h-8 w-8 text-primary absolute inset-0 m-auto" />
      </div>
      <p className="font-bold text-gray-500">جاري تحميل بيانات الطلب...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-6 font-body" dir="rtl">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <div className="space-y-8 animate-in slide-in-from-right duration-700">
          <header className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
               <ArrowRight className="h-4 w-4" /> العودة
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">إتمام الدفع</h1>
            <p className="text-gray-500 text-lg">أدخل بياناتك الشخصية لتأمين طلبك.</p>
          </header>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 space-y-10">
            <div className="flex items-center gap-3 text-primary font-bold border-b border-gray-50 pb-6">
               <User className="h-6 w-6" />
               <span className="text-xl">بيانات العميل</span>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700">الاسم بالكامل</Label>
                <Input 
                  required 
                  placeholder="محمد أحمد علي" 
                  value={customerInfo.name} 
                  onChange={e => setFormData({...customerInfo, name: e.target.value})}
                  className="h-16 bg-gray-50 border-transparent rounded-2xl px-6 text-lg focus:bg-white focus:ring-4 ring-primary/5 transition-all"
                  disabled={showPayment}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">البريد الإلكتروني</Label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="name@email.com" 
                    value={customerInfo.email} 
                    onChange={e => setFormData({...customerInfo, email: e.target.value})}
                    className="h-16 bg-gray-50 border-transparent rounded-2xl text-left font-mono"
                    dir="ltr"
                    disabled={showPayment}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">رقم الجوال</Label>
                  <Input 
                    type="tel" 
                    required 
                    placeholder="05xxxxxxxx" 
                    value={customerInfo.phone} 
                    onChange={e => setFormData({...customerInfo, phone: e.target.value})}
                    className="h-16 bg-gray-50 border-transparent rounded-2xl text-left font-mono"
                    dir="ltr"
                    disabled={showPayment}
                  />
                </div>
              </div>
            </div>

            {type === 'product_order' && !order?.is_digital && (
              <div className="space-y-8 pt-10 border-t border-gray-50 animate-in fade-in">
                <div className="flex items-center gap-3 text-primary font-bold">
                  <Truck className="h-6 w-6" />
                  <span className="text-xl">عنوان الشحن</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <Label className="text-sm font-bold text-gray-700">المدينة</Label>
                     <Input placeholder="الرياض" value={customerInfo.city} onChange={e => setFormData({...customerInfo, city: e.target.value})} className="h-16 bg-gray-50 border-transparent rounded-2xl" disabled={showPayment} />
                   </div>
                   <div className="space-y-3">
                     <Label className="text-sm font-bold text-gray-700">العنوان بالتفصيل</Label>
                     <Input placeholder="حي..." value={customerInfo.address} onChange={e => setFormData({...customerInfo, address: e.target.value})} className="h-16 bg-gray-50 border-transparent rounded-2xl" disabled={showPayment} />
                   </div>
                </div>
              </div>
            )}

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">{error}</div>}
            
            {!showPayment && (
              <Button onClick={handleStartPayment} className="w-full h-20 bg-primary hover:bg-primary/90 text-2xl font-bold rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all">
                المتابعة لاختيار وسيلة الدفع
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8 animate-in slide-in-from-left duration-700">
           <div className="bg-gray-900 text-white p-10 rounded-[3rem] space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="text-2xl font-bold flex items-center gap-4 relative z-10">
                {type === 'domain_request' ? <Globe className="h-7 w-7 text-primary" /> : <Package className="h-7 w-7 text-primary" />}
                ملخص الطلب
              </h3>
              <div className="space-y-8 relative z-10">
                 {type === 'domain_request' ? (
                   <div className="flex justify-between items-start border-b border-white/10 pb-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-bold text-xl">حجز دومين مخصص</span>
                        <span className="font-mono text-primary text-sm">{order?.requested_domain}</span>
                      </div>
                      <span className="font-mono text-2xl text-primary font-bold">{Number(order?.amount).toLocaleString('ar-SA')} ر.س</span>
                   </div>
                 ) : (
                   order?.items?.map((item: any, idx: number) => (
                     <div key={idx} className="flex justify-between items-start border-b border-white/10 pb-6 group">
                        <div className="flex flex-col gap-2">
                          <span className="font-bold text-xl group-hover:text-primary transition-colors">{item.title}</span>
                          <Badge variant="outline" className="w-fit text-[10px] border-white/10 text-gray-400 font-bold px-3 py-1">
                            {item.type === 'physical' ? 'شحن ملموس' : 'تسليم رقمي فوري'}
                          </Badge>
                        </div>
                        <span className="font-mono text-2xl text-primary font-bold">{Number(item.price).toLocaleString('ar-SA')} ر.س</span>
                     </div>
                   ))
                 )}
                 <div className="flex justify-between items-center pt-6">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">الإجمالي النهائي</span>
                    <span className="text-5xl font-bold text-white font-mono tracking-tighter">
                       {(type === 'domain_request' ? order?.amount : order?.total)?.toLocaleString('ar-SA')} <span className="text-sm font-body font-normal text-gray-400">ر.س</span>
                    </span>
                 </div>
              </div>
           </div>

           {showPayment ? (
             <TapPaymentForm 
               amount={type === 'domain_request' ? order?.amount : order?.total} 
               orderId={order.id} 
               storeId={storeId!} 
               customerData={customerInfo}
               onSuccess={handlePaymentSuccess}
             />
           ) : (
             <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-start gap-5">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-primary"><ShieldCheck className="h-8 w-8" /></div>
                <div className="space-y-2">
                  <p className="font-bold text-gray-900 text-lg">بوابات دفع سعودية معتمدة</p>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    نحن نستخدم تقنيات Tap Payments لضمان أعلى درجات الأمان لعملياتك المالية.
                  </p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

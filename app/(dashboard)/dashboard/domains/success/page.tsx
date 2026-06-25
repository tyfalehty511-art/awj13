'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  FileText, 
  CreditCard,
  LayoutDashboard
} from 'lucide-react';

function DomainSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const domain = searchParams.get('domain') || 'example.com';
  const amount = searchParams.get('amount') || '75';
  const paymentId = searchParams.get('id') || 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 font-body space-y-12 animate-in fade-in zoom-in-95 duration-700" dir="rtl">
      {/* Header Success Section */}
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-20 rounded-full animate-pulse"></div>
          <div className="w-28 h-28 bg-green-500 text-white rounded-[3rem] flex items-center justify-center relative z-10 shadow-2xl shadow-green-200 mx-auto">
            <CheckCircle2 className="h-16 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">تم حجز دومينك بنجاح!</h1>
          <p className="text-gray-500 text-lg">شكراً لثقتك بمنصة أوج. جاري الآن إعداد نطاقك المخصص.</p>
        </div>
      </div>

      {/* Premium Invoice Card */}
      <Card className="border-none shadow-2xl shadow-gray-100 bg-white rounded-[2.5rem] overflow-hidden">
        <div className="bg-primary/5 p-8 border-b border-primary/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <FileText className="h-6 w-6 text-primary" />
             <span className="font-bold text-primary">تفاصيل الفاتورة</span>
           </div>
           <span className="text-xs font-bold text-gray-400 font-mono">#{paymentId}</span>
        </div>
        <CardContent className="p-10 space-y-10">
           <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">النطاق المحجوز</p>
                 <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-900" />
                    <span className="text-xl font-bold text-gray-900 font-mono">{domain}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">طريقة الدفع</p>
                 <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-900" />
                    <span className="text-lg font-bold text-gray-900">بطاقة مدى / فيزا</span>
                 </div>
              </div>
           </div>

           <div className="pt-10 border-t border-gray-50">
              <div className="flex justify-between items-center">
                 <span className="text-lg font-bold text-gray-500">إجمالي ما تم دفعه</span>
                 <div className="text-right">
                    <span className="text-4xl font-bold text-green-600 font-mono">{amount}</span>
                    <span className="text-sm font-bold text-gray-400 mr-2">ر.س</span>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm"><CheckCircle2 className="h-5 w-5 text-green-500" /></div>
              <div className="space-y-1">
                 <p className="font-bold text-gray-900 text-sm">ماذا يحدث الآن؟</p>
                 <p className="text-xs text-gray-500 leading-relaxed">
                   سيقوم فريقنا التقني بربط الدومين بمتجرك خلال 24 ساعة كحد أقصى. ستتلقى بريداً إلكترونياً فور تفعيل الرابط رسمياً.
                 </p>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
         <Button 
          onClick={() => router.push('/dashboard')}
          className="h-16 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg gap-3 shadow-xl shadow-primary/20 w-full sm:w-auto transition-all active:scale-95"
         >
           <LayoutDashboard className="h-5 w-5" />
           العودة إلى لوحة التحكم
         </Button>
         <Button 
          variant="ghost"
          onClick={() => router.push('/dashboard/settings')}
          className="h-16 px-8 text-gray-500 font-bold hover:text-gray-900 gap-2"
         >
           إعدادات المتجر <ArrowRight className="h-5 w-5 rotate-180" />
         </Button>
      </div>
    </div>
  );
}

export default function DomainSuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-40"><CheckCircle2 className="animate-pulse text-primary h-12 w-12" /></div>}>
      <DomainSuccessContent />
    </Suspense>
  );
}

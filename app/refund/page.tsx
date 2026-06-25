'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white text-right font-body" dir="rtl">
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-gray-100 sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <Link className="flex items-center gap-2" href="/">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold">أ</span>
          </div>
          <span className="text-xl font-bold text-gray-900">أوج</span>
        </Link>
        <div className="mr-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 font-bold">
              <ArrowRight className="h-4 w-4" /> العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-20 px-6 space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest">
            <RefreshCcw className="h-3 w-3" />
            <span>سياسة عادلة</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">سياسة الاستبدال والاسترجاع</h1>
          <p className="text-gray-500 text-lg">نوضح لك حقوقك كمشترٍ أو كتاجر في حالات الإرجاع.</p>
        </div>

        <section className="prose prose-slate prose-lg max-w-none space-y-10 text-gray-700 leading-relaxed">
          <div className="bg-orange-50/50 p-8 rounded-3xl border border-orange-100 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" /> المنتجات الرقمية والكتب
            </h2>
            <p>
              نظراً لطبيعة المنتجات الرقمية (كتب إلكترونية، ملفات، دورات، أكواد)، فإنه <b>لا يمكن استرجاع المبلغ أو استبدال المنتج</b> بمجرد إرسال رابط التحميل أو تفعيل الخدمة، إلا في الحالات التالية:
            </p>
            <ul className="list-disc pr-6 space-y-2 text-sm">
              <li>إذا كان الملف تالفاً ولا يمكن فتحه أو تحميله.</li>
              <li>إذا كان المنتج مخالفاً تماماً للوصف المذكور في صفحة البيع.</li>
              <li>إذا لم يتم تسليم المنتج للعميل بعد إتمام الدفع.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">المنتجات المادية (الجاهزة)</h2>
            <p>
              يخضع استرجاع المنتجات المادية لسياسة المتجر الخاص بالتاجر، وبما يتوافق مع نظام التجارة الإلكترونية، حيث يحق للعميل طلب الاسترجاع خلال 7 أيام من استلام المنتج بشرط أن يكون بحالته الأصلية ولم يتم فتحه أو استخدامه. يتحمل العميل تكاليف الشحن في حالات الاسترجاع إلا إذا كان الخطأ من التاجر.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">آلية استرداد المبالغ</h2>
            <p>
              عند الموافقة على طلب الاسترجاع، يتم إعادة المبلغ إلى نفس البطاقة المستخدمة في الدفع. قد تستغرق عملية ظهور المبلغ في حسابك البنكي من 5 إلى 14 يوم عمل حسب سياسة البنك المصدر للبطاقة.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          هدفنا هو رضاكم وضمان حقوق الجميع.
        </div>
      </footer>
    </div>
  );
}

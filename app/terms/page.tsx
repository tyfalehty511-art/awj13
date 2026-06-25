'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3" />
            <span>وثيقة قانونية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">شروط الخدمة والاستخدام</h1>
          <p className="text-gray-500 text-lg">آخر تحديث: فبراير 2024</p>
        </div>

        <section className="prose prose-slate prose-lg max-w-none space-y-8 text-gray-700 leading-relaxed">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" /> 1. مقدمة وتعريفات
            </h2>
            <p>
              تُعد منصة "أوج" منصة تقنية تتيح للمبدعين والناشرين (يُشار إليهم بـ "التاجر") إنشاء متاجر إلكترونية لبيع منتجاتهم الرقمية والمادية لعملائهم. باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">2. دور المنصة والعمولة</h2>
            <p>
              تعمل "أوج" كوسيط تقني ومزود خدمة استضافة فقط. تتقاضى المنصة عمولة ثابتة قدرها <b>9%</b> من إجمالي قيمة كل عملية بيع ناجحة تتم عبر المنصة، مقابل تشغيل البنية التحتية، وبوابة الدفع، وخدمات الدعم الفني.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">3. مسؤوليات التاجر</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>يلتزم التاجر بأن تكون كافة المنتجات المعروضة ملكاً له أو يملك حق إعادة بيعها قانوناً.</li>
              <li>يُمنع منعاً باتاً بيع أي محتوى يخالف الشريعة الإسلامية أو الأنظمة السائدة في المملكة العربية السعودية.</li>
              <li>التاجر مسؤول مسؤولية كاملة عن جودة المنتج ووصفه وتسليمه للعميل.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">4. المدفوعات والتحصيل</h2>
            <p>
              تتم معالجة المدفوعات عبر بوابات دفع عالمية معتمدة. يتم إيداع رصيد التاجر (بعد خصم العمولة) في محفظته داخل المنصة، ويحق له طلب سحب الأرباح وفقاً لسياسة الصرف المعتمدة وبحد أدنى يحدده النظام.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">5. الامتثال لنظام التجارة الإلكترونية</h2>
            <p>
              تلتزم المنصة والتجار التابعين لها بمتطلبات نظام التجارة الإلكترونية السعودي، بما في ذلك توفير بيانات التواصل، وسياسة الاستبدال والاسترجاع، وحماية بيانات المستهلك.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} منصة أوج — جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}

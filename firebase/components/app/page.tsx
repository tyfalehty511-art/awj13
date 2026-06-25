
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Feather,
  Rocket,
  ShieldCheck,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Package,
  Download,
  CreditCard,
  Layout,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-right font-body" dir="rtl">
      {/* Navigation Bar */}
      <header className="px-6 lg:px-16 h-20 flex items-center border-b border-gray-50 sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <Link className="flex items-center justify-center gap-3 group" href="/">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <Feather className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">أوج</span>
        </Link>
        <nav className="mr-auto flex gap-6 items-center">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-bold text-gray-500 hover:text-gray-900">تسجيل الدخول</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">ابدأ الآن مجاناً</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(97,104,240,0.05),transparent)] pointer-events-none" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-1000">
                <Sparkles className="h-3 w-3" />
                <span className="uppercase tracking-widest">مستقبل التجارة الرقمية للمبدعين</span>
              </div>
              
              <div className="space-y-6 max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.2] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  متجرك الإلكتروني <br/>
                  <span className="text-primary">في أقل من 60 ثانية</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                  منصة أوج هي الحل المتكامل لبيع كتبك الإلكترونية، دوراتك التدريبية، ومنتجاتك الرقمية والمادية بكل سهولة وأمان مع بوابات دفع محلية.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Link href="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 h-16 text-xl font-bold shadow-2xl shadow-primary/20 group rounded-2xl transition-all">
                    أنشئ متجرك مجاناً <ArrowLeft className="mr-3 h-6 w-6 group-hover:-translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-gray-200 hover:bg-gray-50 text-gray-600 px-10 h-16 text-xl font-bold rounded-2xl transition-all">
                    اكتشف المميزات
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-gray-50/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">لماذا يختار المبدعون "أوج"؟</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">بنينا أدوات متطورة لتمكينك من التركيز على إبداعك، بينما نتولى نحن الجانب التقني والمالي.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 w-fit mb-8">
                  <Download className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">تسليم آلي فوري</h3>
                <p className="text-gray-500 leading-relaxed">يحصل عملاؤك على روابط تحميل منتجاتهم الرقمية أو أكوادهم فور إتمام عملية الدفع بنجاح دون تدخل يدوي منك.</p>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="p-4 rounded-2xl bg-green-50 text-green-600 w-fit mb-8">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">بوابات دفع محلية</h3>
                <p className="text-gray-500 leading-relaxed">نحن ندعم مدى، فيزا، و Apple Pay لضمان أعلى نسبة تحويل لمبيعاتك داخل المملكة والخليج.</p>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 w-fit mb-8">
                  <Layout className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">واجهة احترافية</h3>
                <p className="text-gray-500 leading-relaxed">اختر من بين قوالبنا العصرية وخصص هوية متجرك بما يتناسب مع علامتك التجارية بضغطة زر واحدة.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 relative overflow-hidden">
           <div className="container px-4 md:px-6 relative z-10">
              <div className="bg-primary border border-primary/20 p-12 md:p-20 rounded-[4rem] text-center space-y-8 shadow-2xl relative overflow-hidden text-white">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                 <div className="space-y-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold">ابدأ رحلة نجاحك الرقمي اليوم</h2>
                    <p className="text-white/80 text-lg max-w-xl mx-auto">انضم إلى مئات المبدعين والناشرين الذين وثقوا بـ أوج لتنمية تجارتهم الإلكترونية.</p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <Link href="/login">
                      <Button className="h-16 px-12 bg-white text-primary hover:bg-gray-50 font-bold rounded-2xl text-xl shadow-xl transition-all hover:scale-105">سجل الآن مجاناً</Button>
                    </Link>
                    <Link href="/terms">
                      <Button variant="ghost" className="h-16 px-8 text-white font-bold gap-2 text-lg hover:bg-white/10">تعرف على نظام العمولات</Button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Feather className="text-white h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">أوج</span>
            </div>
            
            <div className="flex gap-8 text-sm font-bold text-gray-500">
               <Link href="/terms" className="hover:text-primary transition-colors">الشروط</Link>
               <Link href="/privacy" className="hover:text-primary transition-colors">الخصوصية</Link>
               <Link href="/refund" className="hover:text-primary transition-colors">الاسترجاع</Link>
            </div>

            <p className="text-sm text-gray-400">© {new Date().getFullYear()} أوج — جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

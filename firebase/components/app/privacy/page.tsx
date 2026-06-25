'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-600 text-xs font-bold uppercase tracking-widest">
            <Lock className="h-3 w-3" />
            <span>خصوصيتك في أمان</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">سياسة الخصوصية وحماية البيانات</h1>
          <p className="text-gray-500 text-lg">نحن نهتم بخصوصيتك ونلتزم بحمايتها وفق أعلى المعايير.</p>
        </div>

        <section className="prose prose-slate prose-lg max-w-none space-y-10 text-gray-700 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" /> ما هي البيانات التي نجمعها؟
            </h2>
            <p>
              نجمع البيانات الضرورية فقط لتقديم الخدمة، وتشمل: اسم المستخدم، البريد الإلكتروني، وبيانات التواصل. بالنسبة للمشترين، نقوم بتخزين تفاصيل الطلب لضمان وصول المنتج الرقمي أو تتبع الشحن.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">أمان المدفوعات</h2>
            <p>
              نحن لا نقوم بتخزين أي بيانات لبطاقات الائتمان أو بطاقات مدى على خوادمنا. تتم جميع العمليات المالية عبر شركة <b>Stripe</b> العالمية المعتمدة، والتي تستخدم تقنيات تشفير متطورة لضمان حماية بياناتك المالية بنسبة 100%.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">مشاركة البيانات</h2>
            <p>
              نحن لا نبيع أو نؤجر بياناتك لأي طرف ثالث. تتم مشاركة بياناتك فقط مع الأطراف الضرورية لإتمام طلبك (مثل التاجر الذي اشتريت منه، أو شركة الشحن إذا كان المنتج مادياً).
            </p>
          </div>

          <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
            <h3 className="text-xl font-bold text-primary mb-2">حقوق المستخدم</h3>
            <p className="text-sm">
              يحق لك في أي وقت طلب نسخة من بياناتك المخزنة لدينا، أو طلب حذف حسابك وبياناتك نهائياً من المنصة عبر التواصل مع الدعم الفني.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          أمن بياناتك هو أولويتنا في منصة أوج.
        </div>
      </footer>
    </div>
  );
}

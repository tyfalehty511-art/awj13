'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-8" dir="rtl">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-sm">
         <XCircle className="h-12 w-12" />
      </div>
      
      <div className="space-y-3 max-w-md">
         <h1 className="text-3xl font-bold text-gray-900">لم يكتمل الدفع</h1>
         <p className="text-gray-500 font-medium">
           عذراً، يبدو أنه تم إلغاء عملية الدفع أو حدث خطأ ما. لا تقلق، لم يتم خصم أي مبالغ من حسابك.
         </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
         <Button onClick={() => window.history.back()} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20">
            المحاولة مرة أخرى <RefreshCw className="mr-2 h-5 w-5" />
         </Button>
         <Link href="/">
            <Button variant="ghost" className="w-full h-12 text-gray-400 font-bold">العودة للرئيسية</Button>
         </Link>
      </div>
    </div>
  );
}

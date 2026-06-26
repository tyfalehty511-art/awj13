'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface TapPayButtonProps {
  amount: number;
  className?: string;
}

/**
 * @fileOverview مكون زر الدفع السريع عبر بوابة Tap.
 * يقوم بإنشاء عملية الدفع وتوجيه المستخدم لصفحة البنك.
 */
export function TapPayButton({ amount, className }: TapPayButtonProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "تنبيه",
        description: "يرجى تسجيل الدخول أولاً لإتمام عملية الشراء.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // إرسال الطلب لمسار الـ API الذي تم إنشاؤه
      const response = await fetch('/api/payment/tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          name: user.displayName || 'عميل أوج',
          email: user.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // التوجيه التلقائي لرابط الدفع المستلم من Tap
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'فشل في إنشاء رابط الدفع');
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast({
        title: "خطأ في الدفع",
        description: error.message || "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={`h-16 px-10 bg-primary hover:bg-primary/90 text-white text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 group ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري الانتقال لبوابة الدفع...</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span>دفع {amount.toLocaleString('ar-SA')} ر.س</span>
          <CreditCard className="h-6 w-6 opacity-80 group-hover:translate-x-[-4px] transition-transform" />
        </div>
      )}
    </Button>
  );
}

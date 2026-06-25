
'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

export function StripeCheckoutForm({ amount, orderId, storeId }: { amount: number, orderId: string, storeId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?orderId=${orderId}&storeId=${storeId}`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "حدث خطأ أثناء معالجة الدفع.");
    } else {
      setMessage("حدث خطأ غير متوقع.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-8 text-right" dir="rtl">
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-primary font-bold mb-4">
           <ShieldCheck className="h-5 w-5" />
           <span>تفاصيل الدفع الآمن</span>
        </div>
        
        <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
        
        {message && (
          <div id="payment-message" className="p-4 bg-red-50 text-red-500 rounded-xl text-sm font-bold border border-red-100">
            {message}
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
         <Button
           disabled={isLoading || !stripe || !elements}
           id="submit"
           className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-bold text-xl rounded-2xl transition-all shadow-lg shadow-primary/20"
         >
           {isLoading ? (
             <Loader2 className="animate-spin h-6 w-6" />
           ) : (
             <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> تأكيد دفع {amount.toLocaleString('ar-SA')} ر.س
             </div>
           )}
         </Button>
         
         <div className="flex justify-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Powered by Stripe</span>
            <span>•</span>
            <span>SSL Encrypted</span>
         </div>
      </div>
    </form>
  );
}

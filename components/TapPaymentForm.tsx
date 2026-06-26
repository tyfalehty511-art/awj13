
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, CreditCard, Smartphone, Check, Lock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';

interface TapPaymentFormProps {
  amount: number;
  orderId: string;
  storeId: string;
  customerData?: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: () => void;
}

export function TapPaymentForm({ amount, orderId, storeId, customerData }: TapPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('mada');
  const { toast } = useToast();
  const auth = useAuth();

  const handlePaymentSubmit = async () => {
    if (!customerData?.email || !customerData?.name || !customerData?.phone) {
      toast({ title: "بيانات ناقصة", description: "يرجى إكمال بيانات العميل أولاً.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken() : '';

      const response = await fetch('/api/payments/tap/charge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': idToken ? `Bearer ${idToken}` : ''
        },
        body: JSON.stringify({
          amount,
          orderId,
          storeId,
          customer: customerData,
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirection to Tap Secure Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'فشل الاتصال ببوابة الدفع');
      }
    } catch (error: any) {
      toast({ 
        title: "فشل الدفع", 
        description: error.message || "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.", 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'mada', label: 'بطاقة مدى البنكية', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'visa', label: 'فيزا / ماستركارد', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'applepay', label: 'Apple Pay', icon: Smartphone, color: 'text-black', bg: 'bg-gray-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
      <Card className="border-gray-100 shadow-xl shadow-gray-100/50 rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="flex items-center gap-3 text-primary font-bold border-b border-gray-50 pb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
               <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-xl">وسيلة الدفع الآمنة</span>
          </div>

          <RadioGroup 
            value={selectedMethod} 
            onValueChange={setSelectedMethod} 
            className="grid gap-4"
          >
            {paymentMethods.map((method) => (
              <label 
                key={method.id}
                className={cn(
                  "flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer group",
                  selectedMethod === method.id 
                    ? "border-primary bg-primary/[0.03] ring-4 ring-primary/5" 
                    : "border-gray-50 bg-white hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-5">
                  <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                  <div className={cn(
                    "p-4 rounded-2xl transition-colors",
                    selectedMethod === method.id ? "bg-primary text-white" : cn(method.bg, method.color)
                  )}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-lg">{method.label}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">معالجة فورية</span>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedMethod === method.id ? "border-primary bg-primary text-white" : "border-gray-200"
                )}>
                  {selectedMethod === method.id && <Check className="h-4 w-4" />}
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Button 
          onClick={handlePaymentSubmit} 
          disabled={loading}
          className="w-full h-20 bg-primary hover:bg-primary/90 text-white font-bold text-2xl rounded-3xl shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] group"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin h-7 w-7" />
              <span>جاري المعالجة...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <Lock className="h-6 w-6 opacity-50 group-hover:scale-110 transition-transform" />
               <span>تأكيد دفع {amount.toLocaleString('ar-SA')} ر.س</span>
            </div>
          )}
        </Button>
        
        <div className="flex justify-center items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-50">
           <span>Secure Gateway by Tap</span>
           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
           <span>PCI-DSS Certified</span>
        </div>
      </div>
    </div>
  );
}

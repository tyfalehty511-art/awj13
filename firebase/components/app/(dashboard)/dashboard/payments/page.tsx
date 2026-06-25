
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { getStoreByOwner, updateStoreSettings } from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Landmark, ShieldCheck, Loader2, Save, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaymentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [payments, setPayments] = useState({
    apple_pay: true,
    mada: true,
    visa_mastercard: true,
    bank_transfer: false,
    tabby_tamara: false
  });

  useEffect(() => {
    async function loadData() {
      if (!user || !db) return;
      const data = await getStoreByOwner(db, user.uid);
      if (data) {
        setStore(data);
        if (data.payment_settings) {
          setPayments(data.payment_settings);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [user, db]);

  const handleToggle = (key: keyof typeof payments) => {
    setPayments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!store || !db) return;
    setSaving(true);
    try {
      await updateStoreSettings(db, store.id, { payment_settings: payments });
      toast({ title: "تم التحديث", description: "تم حفظ إعدادات الدفع بنجاح." });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حفظ التغييرات.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  const paymentOptions = [
    { id: 'apple_pay', title: 'Apple Pay', icon: Smartphone, color: 'text-black', description: 'تفعيل الدفع السريع عبر أجهزة آبل بنقرة واحدة.' },
    { id: 'mada', title: 'بطاقة مدى', icon: CreditCard, color: 'text-blue-600', description: 'استقبال المدفوعات عبر بطاقات مدى السعودية.' },
    { id: 'visa_mastercard', title: 'Visa / MasterCard', icon: Wallet, color: 'text-orange-500', description: 'قبول البطاقات الائتمانية العالمية.' },
    { id: 'bank_transfer', title: 'تحويل بنكي', icon: Landmark, color: 'text-green-600', description: 'توفير خيار التحويل المباشر لحسابك البنكي.' },
    { id: 'tabby_tamara', title: 'تمارا وتابي (قريباً)', icon: ShieldCheck, color: 'text-purple-600', description: 'خيار الدفع الآجل والتقسيط لزيادة مبيعاتك.', disabled: true },
  ];

  return (
    <div className="space-y-10 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-gray-900">طرق الدفع</h1>
          <p className="text-gray-500">فعل وسائل الدفع المفضلة لعملائك لزيادة نسبة التحويل.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-12 px-8 bg-primary font-bold rounded-xl shadow-lg shadow-primary/20">
          {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid gap-6">
        {paymentOptions.map((opt) => (
          <Card key={opt.id} className={`border-gray-100 shadow-sm transition-all overflow-hidden rounded-3xl ${opt.disabled ? 'opacity-60 grayscale' : 'hover:border-primary/20'}`}>
            <CardContent className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl bg-gray-50 ${opt.color}`}>
                  <opt.icon className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{opt.title}</h3>
                    {opt.disabled && <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-bold text-[10px]">قريباً</Badge>}
                    {!opt.disabled && <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">موثق</Badge>}
                  </div>
                  <p className="text-sm text-gray-400 max-w-md">{opt.description}</p>
                </div>
              </div>
              <Switch 
                checked={payments[opt.id as keyof typeof payments]} 
                onCheckedChange={() => !opt.disabled && handleToggle(opt.id as keyof typeof payments)}
                disabled={opt.disabled}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/10 bg-primary/5 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8">
           <div className="p-6 bg-white rounded-3xl shadow-sm">
             <ShieldCheck className="h-12 w-12 text-primary" />
           </div>
           <div className="flex-1 space-y-3 text-center md:text-right">
             <h3 className="text-2xl font-bold text-gray-900">أمان مدفوعاتك هو أولويتنا</h3>
             <p className="text-gray-500 leading-relaxed">
               تتم جميع المعاملات عبر بوابات دفع آمنة ومشفرة بالكامل. يتم إيداع الأرباح في محفظتك تلقائياً بعد خصم عمولة أوج الثابتة (9%).
             </p>
           </div>
           <Button variant="outline" className="border-primary/20 text-primary font-bold h-14 px-8 rounded-2xl">سجل العمليات</Button>
        </CardContent>
      </Card>
    </div>
  );
}

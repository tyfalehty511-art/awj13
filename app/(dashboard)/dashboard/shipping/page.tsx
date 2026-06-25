'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { getStoreByOwner, updateStoreSettings } from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Truck, Package, Globe, MapPin, Loader2, Save, Info, Plus, ChevronLeft, ShieldCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

const CARRIERS = [
  { id: 'aramex', name: 'Aramex (أرامكس)', logo: 'A' },
  { id: 'smsa', name: 'SMSA Express (سمسا)', logo: 'S' },
  { id: 'spl', name: 'SPL (البريد السعودي)', logo: 'SPL' },
  { id: 'dhl', name: 'DHL Express', logo: 'DHL' },
];

export default function ShippingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [shipping, setShipping] = useState({
    type: 'fixed',
    fixed_rate: 25,
    free_shipping_threshold: 200
  });
  const [integrations, setIntegrations] = useState<Record<string, any>>({});
  
  // Dialog state
  const [isAddCarrierOpen, setIsAddCarrierOpen] = useState(false);
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<any>(null);
  const [carrierForm, setCarrierForm] = useState({
    account_number: '',
    api_key: ''
  });

  useEffect(() => {
    async function loadData() {
      if (!user || !db) return;
      try {
        const data = await getStoreByOwner(db, user.uid);
        if (data) {
          setStore(data);
          if (data.shipping_settings) {
            setShipping(data.shipping_settings);
          }
          if (data.shipping_integrations) {
            setIntegrations(data.shipping_integrations);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, db]);

  const handleSaveSettings = async () => {
    if (!store || !db) return;
    setSaving(true);
    try {
      await updateStoreSettings(db, store.id, { 
        shipping_settings: shipping,
        shipping_integrations: integrations
      });
      toast({ title: "تم الحفظ", description: "تم تحديث كافة إعدادات الشحن بنجاح." });
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء حفظ الإعدادات.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openCarrierSelection = () => {
    setIsAddCarrierOpen(true);
  };

  const selectCarrier = (carrier: any) => {
    setSelectedCarrier(carrier);
    const existing = integrations[carrier.id] || {};
    setCarrierForm({
      account_number: existing.account_number || '',
      api_key: existing.api_key || ''
    });
    setIsAddCarrierOpen(false);
    setIsConnectionFormOpen(true);
  };

  const handleSaveCarrier = () => {
    if (!selectedCarrier) return;
    if (!carrierForm.account_number || !carrierForm.api_key) {
      toast({ title: "بيانات ناقصة", description: "يرجى إكمال كافة الحقول للربط.", variant: "destructive" });
      return;
    }

    const updatedIntegrations = {
      ...integrations,
      [selectedCarrier.id]: {
        ...carrierForm,
        is_active: true
      }
    };
    
    setIntegrations(updatedIntegrations);
    setIsConnectionFormOpen(false);
    toast({ title: "تم الربط المحلي", description: `تم تجهيز بيانات ${selectedCarrier.name}. انقر على "تحديث الإعدادات" للحفظ النهائي.` });
  };

  const removeCarrier = (id: string) => {
    const updated = { ...integrations };
    delete updated[id];
    setIntegrations(updated);
    toast({ title: "تم الحذف", description: "تم إزالة شركة الشحن من القائمة." });
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  const activeCarriers = CARRIERS.filter(c => integrations[c.id]?.is_active);

  return (
    <div className="space-y-10 text-right animate-in fade-in duration-500 font-body" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">خيارات الشحن والتسليم</h1>
          <p className="text-gray-500">حدد كيف ستصل منتجاتك الملموسة إلى عملائك.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="h-14 px-10 bg-primary hover:bg-primary/90 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          تحديث كافة الإعدادات
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Pricing Policy */}
          <Card className="border-gray-100 shadow-sm bg-white p-8 rounded-[2.5rem]">
            <CardHeader className="p-0 mb-8 pb-6 border-b border-gray-50">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" /> سياسة تسعير الشحن
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-10">
              <RadioGroup value={shipping.type} onValueChange={(val) => setShipping({...shipping, type: val})} className="grid gap-4">
                <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer group ${shipping.type === 'fixed' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="fixed" className="sr-only" />
                    <div className={`p-4 rounded-2xl ${shipping.type === 'fixed' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-gray-900">سعر ثابت لجميع الطلبات</h4>
                      <p className="text-xs text-gray-400 mt-1">يتم احتساب رسوم ثابتة بغض النظر عن المسافة.</p>
                    </div>
                  </div>
                  {shipping.type === 'fixed' && <div className="text-primary font-bold font-mono">{shipping.fixed_rate} SAR</div>}
                </label>

                <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer group ${shipping.type === 'free' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="free" className="sr-only" />
                    <div className={`p-4 rounded-2xl ${shipping.type === 'free' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-gray-900">شحن مجاني دائم</h4>
                      <p className="text-xs text-gray-400 mt-1">اجذب العملاء بتقديم الشحن المجاني لكافة الطلبات.</p>
                    </div>
                  </div>
                </label>
              </RadioGroup>

              <div className="grid gap-8 md:grid-cols-2 pt-10 border-t border-gray-50">
                 {shipping.type === 'fixed' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-gray-700">تكلفة الشحن الثابتة (ر.س)</Label>
                      <Input 
                        type="number" 
                        value={shipping.fixed_rate} 
                        onChange={e => setShipping({...shipping, fixed_rate: Number(e.target.value)})}
                        className="h-14 bg-gray-50 border-gray-100 rounded-2xl text-xl font-bold" 
                      />
                    </div>
                 )}
                 <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">شحن مجاني عند الطلب بأكثر من (ر.س)</Label>
                    <Input 
                      type="number" 
                      value={shipping.free_shipping_threshold} 
                      onChange={e => setShipping({...shipping, free_shipping_threshold: Number(e.target.value)})}
                      className="h-14 bg-gray-50 border-gray-100 rounded-2xl text-xl font-bold" 
                    />
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Carriers Integration */}
          <Card className="border-gray-100 shadow-sm bg-white p-8 rounded-[2.5rem]">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3"><Package className="h-6 w-6 text-gray-400" /> شركات الشحن المتاحة</h3>
                
                <Dialog open={isAddCarrierOpen} onOpenChange={setIsAddCarrierOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-xl font-bold border-primary/20 text-primary h-12 px-6" onClick={openCarrierSelection}>
                      إضافة شركة شحن <Plus className="mr-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white rounded-[2rem] p-8 text-right max-w-md" dir="rtl">
                    <DialogHeader className="pb-4 border-b border-gray-50">
                      <DialogTitle className="text-2xl font-bold">اختر شركة الشحن للربط</DialogTitle>
                      <DialogDescription className="text-gray-500">انقر على شعار الشركة للبدء في إدخال بيانات الحساب.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-8">
                      {CARRIERS.map(carrier => (
                        <Button 
                          key={carrier.id}
                          variant="outline" 
                          className="h-28 flex flex-col items-center justify-center gap-3 rounded-2xl border-gray-100 hover:border-primary hover:bg-primary/5 group transition-all"
                          onClick={() => selectCarrier(carrier)}
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold text-xl group-hover:bg-primary group-hover:text-white transition-colors">
                            {carrier.logo}
                          </div>
                          <span className="font-bold text-sm">{carrier.name}</span>
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
             </div>
             
             {activeCarriers.length === 0 ? (
               <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95">
                  <Truck className="h-12 w-12 text-gray-200" />
                  <p className="text-gray-400 font-bold">لا توجد شركات شحن مربوطة برمجياً حالياً.</p>
                  <p className="text-[10px] text-gray-300 max-w-xs leading-relaxed uppercase font-bold tracking-widest">Aramex • SMSA • SPL • DHL</p>
               </div>
             ) : (
               <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-500">
                 {activeCarriers.map(carrier => (
                   <div key={carrier.id} className="p-6 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xl">
                          {carrier.logo}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{carrier.name}</p>
                          <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">نشط (Active)</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => selectCarrier(carrier)} className="h-10 w-10 text-gray-400 hover:text-primary">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeCarrier(carrier.id)} className="h-10 w-10 text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-orange-100 bg-orange-50/30 rounded-3xl">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-2 text-orange-600 font-bold">
                <Info className="h-5 w-5" />
                <span>المنتجات الرقمية</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                تذكر أن إعدادات الشحن تطبق فقط على **المنتجات المادية**. الكتب الإلكترونية والدورات تصل للعملاء آلياً دون الحاجة لشحن.
              </p>
            </CardContent>
          </Card>
          
          <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
             <h4 className="font-bold text-primary flex items-center gap-2 text-lg">
               <Globe className="h-5 w-5" /> شحن دولي؟
             </h4>
             <p className="text-xs text-gray-500 leading-relaxed">
               منصة أوج تدعم استقبال الطلبات عالمياً. تأكد من تحديد أسعار تغطي الشحن الدولي إذا كنت تستهدف عملاء خارج منطقتك.
             </p>
          </div>
        </div>
      </div>

      {/* Connection Form Dialog */}
      <Dialog open={isConnectionFormOpen} onOpenChange={setIsConnectionFormOpen}>
        <DialogContent className="max-w-md bg-white rounded-[2rem] p-8 text-right overflow-y-auto max-h-[90vh]" dir="rtl">
          <DialogHeader className="border-b border-gray-50 pb-6">
             <DialogTitle className="text-2xl font-bold flex items-center gap-3">
               <ShieldCheck className="h-7 w-7 text-primary" /> ربط {selectedCarrier?.name}
             </DialogTitle>
             <DialogDescription className="text-gray-500 mt-2">يرجى إدخال بيانات الربط التقني المقدمة من شركة الشحن.</DialogDescription>
          </DialogHeader>

          <div className="py-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">رقم الحساب (Account Number)</Label>
              <Input 
                placeholder="أدخل رقم الحساب" 
                value={carrierForm.account_number}
                onChange={e => setCarrierForm({...carrierForm, account_number: e.target.value})}
                className="h-14 bg-gray-50 border-gray-100 rounded-2xl font-mono px-6"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">مفتاح الربط (API Key)</Label>
              <Input 
                type="password"
                placeholder="••••••••••••" 
                value={carrierForm.api_key}
                onChange={e => setCarrierForm({...carrierForm, api_key: e.target.value})}
                className="h-14 bg-gray-50 border-gray-100 rounded-2xl px-6"
              />
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl flex gap-3 items-start border border-primary/10">
               <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
               <p className="text-[10px] text-gray-500 leading-relaxed">تأكد من صحة البيانات لتتمكن المنصة من توليد بوليصات الشحن آلياً فور إتمام الدفع من قبل العميل.</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 pt-6 border-t border-gray-50">
            <Button onClick={handleSaveCarrier} className="h-14 bg-primary text-white font-bold rounded-2xl w-full text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              حفظ بيانات الربط
            </Button>
            <Button variant="ghost" onClick={() => setIsConnectionFormOpen(false)} className="h-12 text-gray-400 font-bold hover:text-gray-900">
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

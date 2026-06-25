
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  UploadCloud, 
  Tag,
  Download,
  CreditCard,
  Wrench,
  Package,
  ChevronLeft,
  Settings2,
  ListFilter,
  Scale,
  Maximize
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useFirebaseApp, useUser } from '@/firebase';
import { getStoreByOwner, addProduct, uploadProductFile } from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function ProductForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as any) || 'physical';
  
  const db = useFirestore();
  const app = useFirebaseApp();
  const { user } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [isStoreLoading, setIsStoreLoading] = useState(true);
  const platformFee = 9;
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    type: initialType as 'physical' | 'digital' | 'voucher' | 'service',
    store_category: 'الرئيسية', 
    quantity: '10',
    sku: '',
    weight: '',
    dimensions: '',
    imageName: '',
    fileName: '',
    voucherCodes: ''
  });

  useEffect(() => {
    async function fetchData() {
      if (user && db) {
        try {
          const storeData = await getStoreByOwner(db, user.uid);
          if (storeData) {
            setStore(storeData);
            if (storeData.navigation_menu && !storeData.navigation_menu.includes('الرئيسية')) {
              setFormData(prev => ({ ...prev, store_category: storeData.navigation_menu[0] }));
            }
          }
        } catch (err) {
          console.error("Error loading store:", err);
        } finally {
          setIsStoreLoading(false);
        }
      }
    }
    fetchData();
  }, [user, db]);

  const priceNum = parseFloat(formData.price) || 0;
  const commissionAmount = priceNum * (platformFee / 100);
  const merchantEarnings = priceNum - commissionAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !app || !store) return;

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      toast({ title: "خطأ في السعر", description: "يرجى إدخال سعر صحيح للمنتج.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let file_url = '';
      let image_url = '';

      if (selectedFile) file_url = await uploadProductFile(app, selectedFile, store.id);
      if (selectedImage) image_url = await uploadProductFile(app, selectedImage, store.id);

      const productData = {
        title: formData.name,
        price: priceNum,
        type: formData.type,
        store_category: formData.store_category,
        description: formData.description,
        sku: formData.sku || '',
        weight: parseFloat(formData.weight) || 0,
        dimensions: formData.dimensions || '',
        image_url,
        file_url,
        voucher_codes: formData.voucherCodes.split('\n').filter(c => c.trim() !== ''),
        is_digital: formData.type !== 'physical',
        stock: formData.type === 'physical' ? (parseInt(formData.quantity) || 0) : 999
      };

      addProduct(db, store.id, productData);
      toast({ title: "تم النشر بنجاح", description: "سيظهر المنتج في متجرك خلال لحظات." });
      
      setTimeout(() => {
        router.push('/dashboard/products');
      }, 500);

    } catch (error) {
      console.error(error);
      toast({ title: "خطأ", description: "فشل حفظ المنتج.", variant: "destructive" });
      setLoading(false);
    }
  };

  if (isStoreLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link href="/dashboard/products">
             <Button variant="ghost" size="icon" className="rounded-xl"><ChevronLeft className="h-6 w-6 rotate-180" /></Button>
           </Link>
           <h2 className="text-2xl font-bold">إضافة {formData.type === 'physical' ? 'منتج جاهز' : 'منتج رقمي'}</h2>
        </div>
        <Badge className="bg-primary text-white px-4 py-1.5 rounded-full font-bold">عمولة أوج الثابتة: {platformFee}%</Badge>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
               <CardTitle className="text-xl font-bold flex items-center gap-3"><Tag className="h-6 w-6 text-primary" /> المعلومات الأساسية</CardTitle>
               <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Settings2 className="h-4 w-4 text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">النوع التقني: {formData.type}</span>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">مسمى المنتج</Label>
                  <Input placeholder="أدخل اسم المنتج" required className="h-14 bg-gray-50 border-transparent rounded-2xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2"><ListFilter className="h-4 w-4" /> القسم المخصص</Label>
                  <Select value={formData.store_category} onValueChange={(val) => setFormData({...formData, store_category: val})}>
                    <SelectTrigger className="h-14 bg-gray-50 border-transparent rounded-2xl font-bold">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {store?.navigation_menu?.map((label: string) => (
                        <SelectItem key={label} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700">وصف المنتج</Label>
                <Textarea placeholder="اشرح تفاصيل منتجك للعملاء..." className="min-h-[150px] bg-gray-50 border-transparent rounded-2xl p-6 text-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700">صورة العرض الرئيسية</Label>
                <div className="relative min-h-[160px] rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer">
                  {formData.imageName ? <span className="text-primary font-bold">{formData.imageName}</span> : <><UploadCloud className="h-8 w-8 text-gray-300" /><p className="text-xs text-gray-400">رفع صورة احترافية</p></>}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setSelectedImage(f); setFormData({...formData, imageName: f.name}); }
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {formData.type === 'physical' && (
            <Card className="bg-white border-gray-100 shadow-sm rounded-[2.5rem] overflow-hidden p-10 space-y-10">
              <div className="space-y-2">
                 <h3 className="text-xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-primary" /> تفاصيل الشحن والمخزون</h3>
                 <p className="text-sm text-gray-400">هذه البيانات ضرورية لشركات الشحن لحساب التكلفة وتجهيز البوليصة.</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                   <Label className="text-sm font-bold flex items-center gap-2"><Scale className="h-4 w-4" /> الوزن التقريبي (كجم)</Label>
                   <Input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="h-14 rounded-2xl bg-gray-50" placeholder="مثال: 0.5" />
                </div>
                <div className="space-y-3">
                   <Label className="text-sm font-bold flex items-center gap-2"><Maximize className="h-4 w-4" /> الأبعاد (الطول×العرض×الارتفاع) سم</Label>
                   <Input value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} className="h-14 rounded-2xl bg-gray-50" placeholder="مثال: 20x15x5" />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-sm font-bold">الكمية المتوفرة حالياً</Label>
                  <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="h-14 rounded-2xl bg-gray-50" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold">رمز التخزين (SKU)</Label>
                  <Input placeholder="PRD-100" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="h-14 rounded-2xl bg-gray-50" />
                </div>
              </div>
            </Card>
          )}

          {formData.type === 'digital' && (
            <div className="p-12 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex flex-col items-center gap-6 text-center">
               <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-blue-50">
                 <Download className="h-12 w-12" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-2xl font-bold">المنتج رقمي وآمن</h3>
                 <p className="text-gray-500 max-w-sm">ارفع الملف هنا وسيتم إرساله للعميل فوراً وبشكل تلقائي بعد نجاح الدفع.</p>
               </div>
               <Button variant="outline" className="relative h-16 px-12 rounded-2xl border-primary/20 text-primary font-bold text-lg bg-white hover:bg-blue-50">
                 {formData.fileName || 'اختيار ملف المنتج (PDF, ZIP...)'}
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                   const f = e.target.files?.[0];
                   if (f) { setSelectedFile(f); setFormData({...formData, fileName: f.name}); }
                 }} />
               </Button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-900 text-white rounded-[2.5rem] p-8 space-y-8 sticky top-28 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="space-y-2 relative z-10">
              <Label className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">تحديد السعر النهائي</Label>
              <div className="relative">
                <Input type="number" placeholder="0.00" className="h-16 bg-white/5 border-white/10 text-3xl font-mono text-center rounded-2xl text-white font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">SAR</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">عمولة أوج (9%)</span>
                <span className="text-red-400 font-mono">-{commissionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">أرباحك كمنشئ</span>
                <span className="text-3xl font-bold text-green-400 font-mono">{merchantEarnings.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" disabled={loading || !formData.name || !formData.price} className="w-full h-20 bg-primary hover:bg-primary/90 text-2xl font-bold rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all relative z-10 active:scale-95">
              {loading ? <Loader2 className="animate-spin h-7 w-7" /> : "نشر المنتج الآن"}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}

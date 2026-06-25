'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { 
  getStoreByOwner, 
  updateStoreSettings, 
  searchDomainExtensions
} from '@/lib/firestore-service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Loader2, 
  Instagram, 
  MessageCircle, 
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type DomainState = 'idle' | 'searching' | 'results';

/**
 * وظيفة مساعدة لتحويل كائنات Firestore (مثل Timestamps) إلى نصوص بسيطة
 * لتجنب أخطاء التسلسل في Next.js.
 */
function serializeData(data: any) {
  if (!data) return data;
  const serialized = { ...data };
  for (const key in serialized) {
    if (serialized[key]?.toDate && typeof serialized[key].toDate === 'function') {
      serialized[key] = serialized[key].toDate().toISOString();
    } else if (Array.isArray(serialized[key])) {
      serialized[key] = serialized[key].map((item: any) => 
        (typeof item === 'object' && item !== null) ? serializeData(item) : item
      );
    } else if (typeof serialized[key] === 'object' && serialized[key] !== null) {
      serialized[key] = serializeData(serialized[key]);
    }
  }
  return serialized;
}

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainState, setDomainState] = useState<DomainState>('idle');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    meta_description: '',
    whatsapp: '',
    instagram: '',
  });

  useEffect(() => {
    async function loadData() {
      if (!user || !db) return;
      try {
        const data = await getStoreByOwner(db, user.uid);
        if (data) {
          // تأمين البيانات قبل وضعها في الحالة (State)
          const cleanData = serializeData(data);
          setStore(cleanData);
          setFormData({
            name: cleanData.name || '',
            subdomain: cleanData.subdomain || '',
            meta_description: cleanData.meta_description || '',
            whatsapp: cleanData.social_links?.whatsapp || '',
            instagram: cleanData.social_links?.instagram || '',
          });
        } else {
          router.push('/onboarding');
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, db, router]);

  const handleCheckAvailability = async () => {
    const cleanQuery = searchQuery.trim().split('.')[0];
    if (!cleanQuery || cleanQuery.length < 2) {
      toast({ title: "تنبيه", description: "يرجى إدخال اسم مكون من حرفين على الأقل.", variant: "destructive" });
      return;
    }

    setDomainState('searching');
    try {
      const results = await searchDomainExtensions(db, cleanQuery);
      setSearchResults(results);
      setDomainState('results');
    } catch (error) {
      toast({ title: "خطأ", description: "فشل فحص توفر الدومينات.", variant: "destructive" });
      setDomainState('idle');
    }
  };

  const handlePurchase = (domain: string, price: number) => {
    router.push(`/dashboard/domains/checkout?domain=${domain}&price=${price}`);
  };

  const handleSave = () => {
    if (!store || !db) return;
    
    setSaving(true);
    const updatedFields = {
      name: formData.name,
      subdomain: formData.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      meta_description: formData.meta_description,
      social_links: {
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
      }
    };

    // تحديث متفائل (Optimistic Update)
    setStore({ ...store, ...updatedFields });
    
    // عملية غير محظورة (Non-blocking)
    updateStoreSettings(db, store.id, updatedFields);
    
    toast({ title: "تم الحفظ", description: "تمت مزامنة إعدادات المتجر بنجاح." });
    setTimeout(() => setSaving(false), 800);
  };

  if (loading) return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  return (
    <div className="space-y-10 max-w-6xl mx-auto text-right font-body animate-in fade-in duration-500" dir="rtl">
      {/* Premium Header with Save Button at the Top */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">إعدادات المتجر</h1>
          <p className="text-gray-500">تحكم في هوية متجرك، الروابط، وقنوات التواصل في مكان واحد.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="flex-1 md:flex-none h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 gap-3 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            حفظ التعديلات
          </Button>
          {store && (
            <Link href={`/store/${store.subdomain}`} target="_blank">
              <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold border-gray-200 text-gray-600 hover:bg-gray-50 gap-2">
                <ExternalLink className="h-5 w-5" /> معاينة
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Layout below the Header */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-16 bg-gray-100/50 border border-gray-100 rounded-3xl p-2 mb-10">
          <TabsTrigger value="general" className="rounded-2xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">عام (الهوية)</TabsTrigger>
          <TabsTrigger value="domain" className="rounded-2xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">رابط الدومين</TabsTrigger>
          <TabsTrigger value="social" className="rounded-2xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">التواصل</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
          <Card className="border-gray-100 shadow-sm bg-white p-8 md:p-10 rounded-[2.5rem]">
             <div className="space-y-10">
                <div className="grid gap-10 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">اسم المتجر</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="h-16 bg-gray-50 border-gray-100 rounded-2xl text-lg font-bold px-6 focus:bg-white transition-all" 
                      placeholder="أدخل اسم متجرك"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">رابط المتجر الفرعي (Subdomain)</Label>
                    <div className="relative group">
                      <Input 
                        value={formData.subdomain} 
                        onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                        className="h-16 bg-gray-50 border-gray-100 rounded-2xl text-left font-mono text-lg pl-32 focus:bg-white transition-all" 
                        placeholder="my-store"
                        dir="ltr"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r pr-4 border-gray-200 h-6 flex items-center">.awj.site</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">وصف المتجر المختصر</Label>
                  <Textarea 
                    value={formData.meta_description} 
                    onChange={e => setFormData({...formData, meta_description: e.target.value})} 
                    className="min-h-[140px] bg-gray-50 border-gray-100 rounded-2xl p-6 text-lg focus:bg-white transition-all" 
                    placeholder="وصف مختصر يظهر للعملاء وفي محركات البحث لزيادة مبيعاتك..." 
                  />
                </div>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
          <Card className="border-gray-100 shadow-sm bg-white p-8 md:p-10 rounded-[2.5rem] space-y-10">
             <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600"><Globe className="h-8 w-8" /></div>
                <div>
                   <h3 className="text-xl font-bold">ربط دومين مخصص (.com, .sa)</h3>
                   <p className="text-sm text-gray-500">امنح متجرك مظهراً احترافياً برابط خاص بك يزيد من ثقة عملائك.</p>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                   <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                   <Input 
                    placeholder="ابحث عن اسم النطاق... (مثال: myshop)" 
                    className="h-16 pr-14 bg-gray-50 border-gray-100 rounded-2xl text-lg font-bold focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckAvailability()}
                   />
                </div>
                <Button 
                  onClick={handleCheckAvailability} 
                  disabled={domainState === 'searching'}
                  className="h-16 px-12 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-lg gap-2"
                >
                  {domainState === 'searching' ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                  فحص التوفر
                </Button>
             </div>

             {domainState === 'results' && (
                <div className="grid gap-4 animate-in slide-in-from-top-4 duration-500">
                   {searchResults.map((res) => (
                      <div key={res.domain} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${res.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                               {res.available ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            </div>
                            <div>
                               <p className="font-bold text-xl font-mono text-gray-900">{res.domain}</p>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                                  {res.available ? '✅ متاح للتسجيل الفوري' : '❌ غير متاح حالياً'}
                                </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            {res.available && (
                               <>
                                  <div className="text-left">
                                     <p className="text-2xl font-bold text-blue-600 font-mono">{res.price.toLocaleString('ar-SA')} <span className="text-xs font-body">ر.س</span></p>
                                     <p className="text-[10px] text-gray-400 font-bold uppercase">سنوياً</p>
                                  </div>
                                  <Button 
                                    className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100"
                                    onClick={() => handlePurchase(res.domain, res.price)}
                                  >
                                    شراء الآن
                                  </Button>
                               </>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
           <Card className="border-gray-100 shadow-sm bg-white p-8 md:p-10 rounded-[2.5rem]">
              <div className="grid gap-10 md:grid-cols-2">
                 <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2 text-gray-700"><MessageCircle className="h-5 w-5 text-green-500" /> واتساب التواصل للعملاء</Label>
                    <Input 
                      value={formData.whatsapp} 
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
                      className="h-16 bg-gray-50 border-gray-100 rounded-2xl px-6 text-lg focus:bg-white transition-all" 
                      placeholder="9665xxxxxxxx" 
                      dir="ltr"
                    />
                    <p className="text-[10px] text-gray-400 mr-2">أدخل الرقم بدون (+) وبدون أصفار دولية في البداية.</p>
                 </div>
                 <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2 text-gray-700"><Instagram className="h-5 w-5 text-pink-500" /> رابط حساب إنستقرام</Label>
                    <Input 
                      value={formData.instagram} 
                      onChange={e => setFormData({...formData, instagram: e.target.value})} 
                      className="h-16 bg-gray-50 border-gray-100 rounded-2xl px-6 text-lg focus:bg-white transition-all" 
                      placeholder="username" 
                      dir="ltr"
                    />
                 </div>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

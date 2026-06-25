'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFirestore, useUser, useFirebaseApp } from '@/firebase';
import { 
  getStoreByOwner, 
  updateStoreSettings, 
  uploadLogo 
} from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Loader2, 
  Palette,
  Camera,
  Plus,
  ListTree,
  ExternalLink,
  Monitor,
  Layout,
  Type,
  Sparkles,
  Grid3X3,
  Box,
  Menu,
  MoreHorizontal,
  Trash2,
  ChevronRight,
  ArrowRight,
  Link as LinkIcon,
  Settings2,
  Image as ImageIcon,
  UploadCloud,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STYLE_PRESETS = {
  modern: { button_radius: 50 },
  classic: { button_radius: 8 },
  bold: { button_radius: 0 },
  luxury: { button_radius: 2 },
  magazine: { button_radius: 4 },
  retro: { button_radius: 0 }
};

const TEMPLATE_PREVIEWS = [
  { id: 'modern', label: 'عصري (Modern)', desc: 'تصميم ناعم، أزرار دائرية تماماً، وظلال عميقة.' },
  { id: 'classic', label: 'كلاسيكي (Classic)', desc: 'توازن مثالي، زوايا بسيطة، مظهر نظيف.' },
  { id: 'bold', label: 'جريء (Bold)', desc: 'تباين عالي، حواف حادة، تصميم صريح وقوي.' },
  { id: 'luxury', label: 'فاخر (Luxury)', desc: 'نصوص راقية، لمسات فخامة مطلقة.' },
  { id: 'magazine', label: 'المجلة (Magazine)', desc: 'تنسيق تحريري، تركيز على التبويب والشبكة.' },
  { id: 'retro', label: 'ريترو (Retro)', desc: 'إطارات سميكة، روح العقد الماضي.' }
];

const BACKGROUND_PRESETS = [
  { id: 'fashion-dark', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800', label: 'موضة داكنة' },
  { id: 'luxury-interior', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800', label: 'فخامة داخلية' },
  { id: 'grad-blue', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800', label: 'تدرج أزرق' },
  { id: 'pattern-dots', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800', label: 'نقاط كلاسيكية' },
  { id: 'tech-dark', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', label: 'تقني داكن' },
  { id: 'minimal-white', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', label: 'أبيض مينيمال' }
];

const READY_MADE_BLUEPRINTS = [
  {
    id: 'fashion-wyluxe',
    name: 'قالب الأناقة (Fashion Style)',
    description: 'مستوحى من متاجر الماركات العالمية، يعتمد على صور كبيرة، قائمة جانبية، وأزرار دائرية ناعمة.',
    preview: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    config: {
      theme_primary: '#000000',
      brand_headline: 'مجموعة الربيع وصلت - خصم 30%',
      store_description: 'أفضل الخامات لأرقى الأذواق، صُممت لتناسب يومك.',
      template_choice: 'modern',
      navigation_mode: 'sidebar',
      background_pattern: 'none',
      button_radius: 50,
      hero_image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
      footer_type: 'preset',
      footer_presets: { about: true, terms: true, privacy: true }
    }
  },
  {
    id: 'luxury-gold',
    name: 'القالب الفاخر الذهبي',
    description: 'مثالي للمتاجر الراقية، يعتمد على تدرجات الذهبي والخطوط الكلاسيكية الفاخرة.',
    preview: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    config: {
      theme_primary: '#D4AF37',
      template_choice: 'luxury',
      navigation_mode: 'horizontal',
      background_pattern: 'geometric',
      button_radius: 2,
      footer_type: 'preset',
      footer_presets: { about: true, terms: true, privacy: true }
    }
  },
  {
    id: 'modern-dark',
    name: 'القالب العصري الداكن',
    description: 'تصميم قوي بتباين عالٍ، مناسب لبيع المنتجات الرقمية والتقنية.',
    preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    config: {
      theme_primary: '#000000',
      template_choice: 'bold',
      navigation_mode: 'both',
      background_pattern: 'grid',
      button_radius: 0,
      footer_type: 'custom',
      footer_custom_links: [
        { title: 'روابط هامة', content: 'نحن نسعى لتقديم أفضل تجربة تسوق رقمية في العالم العربي.' }
      ]
    }
  },
  {
    id: 'soft-minimal',
    name: 'القالب البسيط (Minimal)',
    description: 'تركيز كامل على المنتجات مع مساحات بيضاء واسعة وخطوط ناعمة ومريحة.',
    preview: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800',
    config: {
      theme_primary: '#6168F0',
      template_choice: 'modern',
      navigation_mode: 'sidebar',
      background_pattern: 'dots',
      button_radius: 50,
      footer_type: 'preset',
      footer_presets: { about: true, terms: false, privacy: true }
    }
  }
];

function TemplateBlueprint({ id }: { id: string }) {
  const brandColor = "#6168F0";
  switch(id) {
    case 'modern':
      return (
        <div className="w-full h-full bg-slate-50 p-4 flex flex-col gap-3 items-center justify-center">
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
          <div className="flex w-full gap-3 justify-center items-center">
             <div className="w-2/5 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-slate-100" /></div>
             <div className="flex-1 flex flex-col gap-2"><div className="h-3 w-full bg-slate-200 rounded-full" /><div className="h-8 w-full rounded-full" style={{ backgroundColor: brandColor + '20', border: `1px solid ${brandColor}40` }} /></div>
          </div>
        </div>
      );
    default: return <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Box className="text-slate-300" /></div>;
  }
}

export default function StorefrontCenter() {
  const { user } = useUser();
  const db = useFirestore();
  const app = useFirebaseApp();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [view, setView] = useState<'main' | 'footer'>('main');
  
  const [designSettings, setDesignSettings] = useState({
    theme_primary: '#6168F0',
    layout_style: 'grid' as 'grid' | 'list',
    navigation_menu: ['الرئيسية'] as string[],
    brand_headline: '',
    store_description: '',
    template_choice: 'modern',
    button_radius: 12,
    background_pattern: 'none' as 'none' | 'dots' | 'grid' | 'geometric',
    navigation_mode: 'horizontal' as 'horizontal' | 'sidebar' | 'both',
    footer_type: 'preset' as 'preset' | 'custom',
    footer_presets: {
      about: true,
      terms: true,
      privacy: true
    },
    footer_custom_links: [] as { title: string, content: string }[],
    hero_image_url: ''
  });

  const [newMenuLabel, setNewMenuLabel] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user || !db) return;
      try {
        const data = await getStoreByOwner(db, user.uid);
        if (data) {
          setStore(data);
          setDesignSettings({
            theme_primary: data.theme_primary || '#6168F0',
            layout_style: data.layout_style || 'grid',
            navigation_menu: data.navigation_menu || ['الرئيسية'],
            brand_headline: data.brand_headline || '',
            store_description: data.store_description || '',
            template_choice: data.template_choice || 'modern',
            button_radius: data.button_radius ?? 12,
            background_pattern: data.background_pattern || 'none',
            navigation_mode: data.navigation_mode || 'horizontal',
            footer_type: data.footer_type || 'preset',
            footer_presets: data.footer_presets || { about: true, terms: true, privacy: true },
            footer_custom_links: data.footer_custom_links || [],
            hero_image_url: data.hero_image_url || ''
          });
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحميل بيانات المتجر.' });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, db, router, toast]);

  const handleTemplateChange = (template: string) => {
    const preset = STYLE_PRESETS[template as keyof typeof STYLE_PRESETS];
    startTransition(() => {
      setDesignSettings(prev => ({
        ...prev,
        template_choice: template,
        button_radius: preset ? preset.button_radius : prev.button_radius
      }));
    });
  };

  const handleApplyReadyMadeTemplate = (config: any) => {
    setDesignSettings(prev => ({
      ...prev,
      ...config
    }));
    toast({ 
      title: "تم تطبيق النموذج بنجاح", 
      description: "اضغط على 'حفظ التعديلات' في الأعلى لاعتماده بشكل دائم في متجرك.",
    });
  };

  const handleSave = async () => {
    if (!store || !db) return;
    setSaving(true);
    try {
      await updateStoreSettings(db, store.id, designSettings);
      toast({ title: "تم الحفظ", description: "تمت مزامنة كافة إعدادات الواجهة بنجاح." });
    } catch (error) {
      console.error(error);
      toast({ title: "خطأ", description: "فشل حفظ التعديلات.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store || !app) return;
    setLogoUploading(true);
    try {
      const url = await uploadLogo(app, file, store.id);
      await updateStoreSettings(db!, store.id, { logo_url: url });
      setStore({ ...store, logo_url: url });
      toast({ title: "تم الرفع", description: "تم تحديث شعار المتجر بنجاح." });
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل رفع الشعار.' });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store || !app) return;
    setBgUploading(true);
    try {
      const url = await uploadLogo(app, file, store.id); 
      setDesignSettings(prev => ({ ...prev, hero_image_url: url }));
      toast({ title: "تم الرفع", description: "تم تجهيز الخلفية المخصصة." });
    } catch (err) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل رفع الخلفية.' });
    } finally {
      setBgUploading(false);
    }
  };

  const removeMenuItem = (index: number) => {
    const updated = [...designSettings.navigation_menu];
    updated.splice(index, 1);
    setDesignSettings({ ...designSettings, navigation_menu: updated });
  };

  const addFooterLink = () => {
    setDesignSettings(prev => ({
      ...prev,
      footer_custom_links: [...prev.footer_custom_links, { title: '', content: '' }]
    }));
  };

  const removeFooterLink = (index: number) => {
    const updated = [...designSettings.footer_custom_links];
    updated.splice(index, 1);
    setDesignSettings({ ...designSettings, footer_custom_links: updated });
  };

  const updateFooterLink = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...designSettings.footer_custom_links];
    updated[index] = { ...updated[index], [field]: value };
    setDesignSettings({ ...designSettings, footer_custom_links: updated });
  };

  if (loading) return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  if (view === 'footer') {
    return (
      <div className="space-y-10 max-w-4xl mx-auto text-right font-body animate-in slide-in-from-left duration-500 pb-20 px-4 md:px-0" dir="rtl">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-8">
           <Button variant="ghost" size="icon" onClick={() => setView('main')} className="rounded-xl"><ArrowRight className="h-6 w-6" /></Button>
           <div>
             <h1 className="text-3xl font-bold text-gray-900">تعديل العناوين السفلية (الفوتر) 🔗</h1>
             <p className="text-gray-500">تحكم في الروابط والمعلومات التي تظهر في أسفل متجرك.</p>
           </div>
        </div>

        <Card className="border-gray-100 bg-white p-8 md:p-10 rounded-[2.5rem] space-y-10">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-xl font-bold">نوع المحتوى السفلي</h3>
                 <p className="text-sm text-gray-400">اختر بين قوالب جاهزة أو إضافة محتوى مخصص تماماً.</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                 <Button 
                   variant={designSettings.footer_type === 'preset' ? 'default' : 'ghost'} 
                   className="rounded-xl font-bold px-6"
                   onClick={() => setDesignSettings({...designSettings, footer_type: 'preset'})}
                 >جاهز</Button>
                 <Button 
                   variant={designSettings.footer_type === 'custom' ? 'default' : 'ghost'} 
                   className="rounded-xl font-bold px-6"
                   onClick={() => setDesignSettings({...designSettings, footer_type: 'custom'})}
                 >مخصص</Button>
              </div>
           </div>

           {designSettings.footer_type === 'preset' ? (
             <div className="grid gap-6">
                {[
                  { key: 'about', label: 'من نحن (About Us)', icon: Monitor, color: 'text-primary' },
                  { key: 'terms', label: 'الشروط والأحكام', icon: Settings2, color: 'text-orange-500' },
                  { key: 'privacy', label: 'سياسة الخصوصية', icon: Layout, color: 'text-blue-500' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 bg-white rounded-xl shadow-sm ${item.color}`}><item.icon className="h-5 w-5" /></div>
                        <div><p className="font-bold">{item.label}</p><p className="text-xs text-gray-400">عرض نبذة عن المتجر وأهدافه</p></div>
                     </div>
                     <Switch 
                       checked={designSettings.footer_presets[item.key as keyof typeof designSettings.footer_presets]} 
                       onCheckedChange={(val) => setDesignSettings({
                         ...designSettings, 
                         footer_presets: {...designSettings.footer_presets, [item.key]: val}
                       })} 
                     />
                  </div>
                ))}
             </div>
           ) : (
             <div className="space-y-8">
                <div className="grid gap-6">
                   {designSettings.footer_custom_links.map((link, idx) => (
                     <div key={idx} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6 relative group animate-in slide-in-from-top-2 duration-300">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute left-4 top-4 text-gray-300 hover:text-red-500 rounded-xl transition-colors"
                          onClick={() => removeFooterLink(idx)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                        
                        <div className="space-y-3">
                           <Label className="text-sm font-bold text-gray-700">اسم العنوان السفلي</Label>
                           <Input 
                             value={link.title}
                             onChange={(e) => updateFooterLink(idx, 'title', e.target.value)}
                             className="h-14 bg-white border-gray-100 rounded-2xl px-6 font-bold"
                             placeholder="مثال: روابط هامة أو سياسة الاسترجاع"
                           />
                        </div>

                        <div className="space-y-3">
                           <Label className="text-sm font-bold text-gray-700">وصف ومضمون العنوان</Label>
                           <Textarea 
                             value={link.content}
                             onChange={(e) => updateFooterLink(idx, 'content', e.target.value)}
                             className="min-h-[140px] bg-white border-gray-100 rounded-2xl p-6 text-base"
                             placeholder="اكتب هنا التفاصيل التي تريد عرضها أسفل هذا العنوان..."
                           />
                        </div>
                     </div>
                   ))}
                </div>

                {designSettings.footer_custom_links.length === 0 && (
                   <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-[2rem] space-y-4">
                      <div className="p-4 bg-gray-50 w-fit mx-auto rounded-full text-gray-300"><ListTree className="h-8 w-8" /></div>
                      <p className="text-gray-400 font-bold">لا توجد عناوين مخصصة بعد.</p>
                   </div>
                )}

                <Button 
                  onClick={addFooterLink}
                  className="w-full h-16 bg-gray-900 text-white rounded-2xl font-bold text-lg gap-3 shadow-xl transition-all hover:scale-[1.01] active:scale-95"
                >
                  <Plus className="h-6 w-6" /> إضافة عنوان سفلي جديد
                </Button>
             </div>
           )}
        </Card>

        <div className="flex justify-end gap-4">
           <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold" onClick={() => setView('main')}>إلغاء والعودة</Button>
           <Button onClick={handleSave} disabled={saving} className="h-14 px-12 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 gap-2">
             {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
             حفظ وإغلاق
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto text-right font-body animate-in fade-in duration-500 pb-20 px-4 md:px-0" dir="rtl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">واجهة المتجر</h1>
          <p className="text-sm md:text-base text-gray-500">تطبيق تعديلات حية وسريعة على شكل متجرك.</p>
        </div>
        <div className="flex flex-row gap-4 w-full md:w-auto items-center">
          <Link href={`/store/${store?.subdomain}?preview=true`} target="_blank" className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full h-12 md:h-14 px-6 md:px-8 rounded-2xl font-bold border-primary/20 text-primary transition-all">
              <ExternalLink className="h-5 w-5" /> معاينة
            </Button>
          </Link>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex-1 md:flex-none h-12 md:h-14 px-8 md:px-10 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 gap-2 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            حفظ التعديلات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ready_made" className="w-full">
        <TabsList className="flex items-center justify-start h-16 bg-gray-100/50 border border-gray-100 rounded-3xl p-2 mb-10 overflow-x-auto no-scrollbar gap-2 md:grid md:grid-cols-6 md:w-full">
          <TabsTrigger value="ready_made" className="px-6 rounded-2xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-primary transition-all flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> الموقع الجاهز
          </TabsTrigger>
          <TabsTrigger value="templates" className="px-6 rounded-2xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-primary transition-all">القوالب</TabsTrigger>
          <TabsTrigger value="branding" className="px-6 rounded-2xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-primary transition-all">الهوية والشعار</TabsTrigger>
          <TabsTrigger value="store_page" className="px-6 rounded-2xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-primary transition-all">صفحة المتجر</TabsTrigger>
          <TabsTrigger value="advanced" className="px-6 rounded-2xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-primary transition-all">متقدم</TabsTrigger>
          <TabsTrigger value="navigation" className="px-6 rounded-2xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-primary transition-all">القوائم</TabsTrigger>
        </TabsList>

        <TabsContent value="ready_made" className="animate-in slide-in-from-bottom-2 duration-300">
           <Card className="border-gray-100 bg-white p-6 md:p-10 rounded-[2.5rem] space-y-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-50 pb-8">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-bold flex items-center gap-3"><Zap className="h-6 w-6 text-yellow-500 fill-current" /> تطبيق نموذج جاهز بنقرة واحدة</h3>
                    <p className="text-gray-500">اختر أحد القوالب الفاخرة التي أعدها خبراؤنا لتجهيز متجرك بالكامل فوراً.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {READY_MADE_BLUEPRINTS.map((tmpl) => (
                   <Card key={tmpl.id} className="group overflow-hidden rounded-[2.5rem] border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                      <div className="aspect-[16/10] relative overflow-hidden">
                         <img src={tmpl.preview} alt={tmpl.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <p className="text-white text-xs font-bold leading-relaxed">{tmpl.description}</p>
                         </div>
                      </div>
                      <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-6">
                         <div className="space-y-2 text-center">
                            <h4 className="text-xl font-bold text-gray-900">{tmpl.name}</h4>
                            <p className="text-xs text-gray-400 font-medium">{tmpl.id === 'luxury-gold' ? 'ستايل ملكي' : tmpl.id === 'modern-dark' ? 'ستايل جريء' : 'ستايل هادئ'}</p>
                         </div>
                         <Button 
                            onClick={() => handleApplyReadyMadeTemplate(tmpl.config)}
                            className="w-full h-14 bg-gray-900 hover:bg-primary text-white rounded-2xl font-bold shadow-xl shadow-gray-200 gap-2 transition-all active:scale-95"
                         >
                            <CheckCircle2 className="h-4 w-4" /> تطبيق الموقع الجاهز
                         </Button>
                      </CardContent>
                   </Card>
                ))}
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
           <Card className="border-gray-100 bg-white p-6 md:p-10 rounded-[2.5rem] space-y-10">
              <h3 className="text-xl font-bold flex items-center gap-3"><Layout className="h-6 w-6 text-primary" /> اختيار القالب</h3>
              <RadioGroup value={designSettings.template_choice} onValueChange={handleTemplateChange} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {TEMPLATE_PREVIEWS.map((tmpl) => (
                  <Label key={tmpl.id} htmlFor={tmpl.id} className={`group flex flex-col rounded-[2rem] border-2 cursor-pointer transition-all ${designSettings.template_choice === tmpl.id ? 'border-primary bg-primary/[0.02]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <RadioGroupItem value={tmpl.id} id={tmpl.id} className="sr-only" />
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100 rounded-t-[1.8rem]"><TemplateBlueprint id={tmpl.id} /></div>
                    <div className="p-6"><p className="font-bold text-lg text-gray-900">{tmpl.label}</p><p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{tmpl.desc}</p></div>
                  </Label>
                ))}
              </RadioGroup>
           </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <Label className="text-sm font-bold text-gray-700 text-center block">شعار المتجر الرسمي</Label>
              <Card className="aspect-square max-w-[320px] mx-auto rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50 group relative cursor-pointer hover:border-primary/30 transition-all">
                  {store?.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-contain p-6" /> : <Camera className="h-12 w-12 text-gray-200" />}
                  {logoUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
              </Card>
            </div>

            <div className="space-y-6">
              <Label className="text-sm font-bold text-gray-700 text-center block">خلفية الموقع (Hero Image)</Label>
              <Card className="p-8 rounded-[2.5rem] border-gray-100 bg-white shadow-sm space-y-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">خلفيات جاهزة من كانفا</p>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                       {BACKGROUND_PRESETS.map((preset) => (
                          <button 
                            key={preset.id}
                            onClick={() => setDesignSettings({...designSettings, hero_image_url: preset.url})}
                            className={`min-w-[120px] aspect-video rounded-xl overflow-hidden border-2 transition-all relative group ${designSettings.hero_image_url === preset.url ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-gray-200'}`}
                          >
                             <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="relative group">
                    <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${designSettings.hero_image_url && !BACKGROUND_PRESETS.find(p => p.url === designSettings.hero_image_url) ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:border-primary/20'}`}>
                       {bgUploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <><UploadCloud className="h-8 w-8 text-gray-300" /><span className="text-[10px] font-bold text-gray-500">رفع خلفية مخصصة</span></>}
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleBackgroundUpload} accept="image/*" />
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="store_page" className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
           <Card className="border-gray-100 bg-white p-8 md:p-10 rounded-[2.5rem] space-y-10">
              <div className="grid gap-8 md:grid-cols-2 border-b border-gray-50 pb-10">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Type className="h-4 w-4" /> عنوان المتجر الرئيسي</Label>
                  <Input className="h-14 md:h-16 bg-gray-50 border-gray-100 rounded-2xl p-4 text-base md:text-lg font-bold" value={designSettings.brand_headline} onChange={e => setDesignSettings({...designSettings, brand_headline: e.target.value})} placeholder="أدخل العنوان هنا..." />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">نبذة عن المتجر</Label>
                  <Textarea className="min-h-[120px] bg-gray-50 border-gray-100 rounded-2xl p-4 text-base" value={designSettings.store_description} onChange={e => setDesignSettings({...designSettings, store_description: e.target.value})} placeholder="اكتب نبذة عن متجرك..." />
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center gap-6">
                 <Button 
                   onClick={() => setView('footer')}
                   className="h-16 px-12 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-lg gap-3 shadow-xl transition-all hover:scale-105 active:scale-95"
                 >
                   تعديل العناوين السفلية (الفوتر) 🔗
                 </Button>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="navigation" className="animate-in slide-in-from-bottom-2 duration-300">
          <Card className="border-gray-100 bg-white p-8 md:p-10 rounded-[2.5rem] space-y-10">
            <h3 className="text-xl font-bold mb-10 border-b pb-6 flex items-center gap-3"><ListTree className="h-7 w-7 text-primary" /> بناء قوائم الأقسام</h3>
            <div className="space-y-6">
               <div className="grid gap-4">
                  {designSettings.navigation_menu.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                       <span className="font-bold text-gray-700">{item}</span>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         disabled={item === 'الرئيسية'}
                         onClick={() => removeMenuItem(idx)}
                         className="h-10 w-10 text-gray-300 hover:text-red-500 rounded-xl"
                       >
                         <Trash2 className="h-5 w-5" />
                       </Button>
                    </div>
                  ))}
               </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


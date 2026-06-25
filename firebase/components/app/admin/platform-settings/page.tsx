'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser, useFirebaseApp, useAuth } from '@/firebase';
import { getPlatformSettings, updatePlatformSettings, uploadPlatformLogo } from '@/lib/firestore-service';
import { signOut } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Settings, 
  ImageIcon, 
  Bell, 
  Save, 
  Loader2, 
  ShieldCheck, 
  Globe,
  Camera,
  Twitter,
  Instagram,
  Youtube,
  Feather,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'faleh18511@gmail.com';

export default function PlatformSettingsPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const app = useFirebaseApp();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: 'أوج',
    logoUrl: '',
    primaryColor: '#6168F0',
    announcementText: '',
    announcementActive: false,
    copyrightText: '© 2024 أوج — جميع الحقوق محفوظة.',
    socialLinks: {
      twitter: '',
      instagram: '',
      youtube: ''
    }
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login');
        return;
      }
    }

    async function loadSettings() {
      if (!db || !user || user.email !== ADMIN_EMAIL) return;
      try {
        const data = await getPlatformSettings(db);
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user, authLoading, db, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تسجيل الخروج.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!db) return;
    setSaving(true);
    try {
      await updatePlatformSettings(db, settings);
      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات المنصة بنجاح." });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !app) return;
    
    setLogoUploading(true);
    try {
      const url = await uploadPlatformLogo(app, file);
      setSettings({ ...settings, logoUrl: url });
      toast({ title: "تم الرفع", description: "تم تحديث شعار المنصة." });
    } catch (error) {
      toast({ title: "فشل الرفع", description: "حدث خطأ أثناء رفع الشعار.", variant: "destructive" });
    } finally {
      setLogoUploading(false);
    }
  };

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center bg-[#0F1115]"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-[#0F1115] text-white font-body pb-20 text-right" dir="rtl">
      <header className="sticky top-0 z-50 bg-[#16191F]/80 backdrop-blur-md border-b border-white/5 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">إعدادات المنصة العامة</h1>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">تحكم كامل في هوية أوج</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 gap-2 font-bold h-12 px-6 rounded-xl transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-bold gap-2">
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
            حفظ التغييرات
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-10 space-y-10">
        {/* Branding Section */}
        <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <ImageIcon className="h-6 w-6 text-primary" /> هوية المنصة (Branding)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="grid gap-10 md:grid-cols-3">
              <div className="space-y-4">
                <Label className="text-sm font-bold text-gray-400">شعار المنصة الرئيسي</Label>
                <div className="relative group aspect-square">
                  <div className="w-full h-full rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden bg-white/5 hover:border-primary/50 transition-all">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                    ) : (
                      <Feather className="h-12 w-12 text-white/20" />
                    )}
                    {logoUploading && <div className="absolute inset-0 bg-[#16191F]/80 flex items-center justify-center rounded-3xl"><Loader2 className="animate-spin text-primary" /></div>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-8">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-400">اسم الموقع الرسمي</Label>
                  <Input 
                    value={settings.siteName} 
                    onChange={e => setSettings({...settings, siteName: e.target.value})}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-400">اللون الأساسي للمنصة (Primary Color)</Label>
                  <div className="flex gap-4">
                    <Input 
                      type="color"
                      value={settings.primaryColor} 
                      onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                      className="h-14 w-24 bg-white/5 border-white/10 rounded-2xl cursor-pointer p-2" 
                    />
                    <Input 
                      value={settings.primaryColor} 
                      onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                      className="h-14 flex-1 bg-white/5 border-white/10 rounded-2xl font-mono" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcement Section */}
        <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Bell className="h-6 w-6 text-orange-500" /> شريط الإعلانات العالمي
              </CardTitle>
              <CardDescription className="text-gray-500">سيظهر هذا نص في أعلى كافة صفحات الموقع.</CardDescription>
            </div>
            <Switch 
              checked={settings.announcementActive} 
              onCheckedChange={(val) => setSettings({...settings, announcementActive: val})} 
            />
          </CardHeader>
          <CardContent className="p-8">
            <Textarea 
              placeholder="اكتب نص الإعلان هنا... مثال: تم تحديث نظام العمولات الجديد!" 
              className="min-h-[100px] bg-white/5 border-white/10 rounded-2xl p-4 text-lg"
              value={settings.announcementText}
              onChange={e => setSettings({...settings, announcementText: e.target.value})}
            />
          </CardContent>
        </Card>

        {/* Footer & Social Section */}
        <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Globe className="h-6 w-6 text-blue-500" /> التذييل والروابط الاجتماعية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-400">حقوق الطبع والنشر (Copyright)</Label>
              <Input 
                value={settings.copyrightText} 
                onChange={e => setSettings({...settings, copyrightText: e.target.value})}
                className="h-14 bg-white/5 border-white/10 rounded-2xl" 
              />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label className="text-xs font-bold flex items-center gap-2"><Twitter className="h-3 w-3" /> إكس (تويتر)</Label>
                <Input 
                  value={settings.socialLinks.twitter} 
                  onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, twitter: e.target.value}})}
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-mono text-sm" 
                  placeholder="@username"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold flex items-center gap-2"><Instagram className="h-3 w-3" /> إنستقرام</Label>
                <Input 
                  value={settings.socialLinks.instagram} 
                  onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, instagram: e.target.value}})}
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-mono text-sm" 
                  placeholder="@username"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold flex items-center gap-2"><Youtube className="h-3 w-3" /> يوتيوب</Label>
                <Input 
                  value={settings.socialLinks.youtube} 
                  onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, youtube: e.target.value}})}
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-mono text-sm" 
                  placeholder="channel_url"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

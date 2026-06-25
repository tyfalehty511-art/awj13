
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Store, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [storeName, setStoreName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const checkSubdomainAvailability = async (val: string) => {
    if (!val || val.length < 3) {
      setSubdomainAvailable(null);
      return;
    }
    setCheckingSubdomain(true);
    try {
      const q = query(collection(db, 'stores'), where('subdomain', '==', val.toLowerCase()));
      const snap = await getDocs(q);
      setSubdomainAvailable(snap.empty);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !subdomainAvailable) {
       toast({ title: "تنبيه", description: "يرجى اختيار رابط متاح للمتجر أولاً.", variant: "destructive" });
       return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'stores'), {
        name: storeName,
        subdomain: subdomain.toLowerCase(),
        owner_uid: user.uid,
        category: 'general',
        theme_primary: '#6168F0',
        theme_accent: '#6BCEF5',
        meta_title: `${storeName} | متجرنا الإلكتروني`,
        createdAt: serverTimestamp()
      });

      toast({
        title: "مبروك! تم إنشاء متجرك",
        description: "أهلاً بك في عائلة أوج. لنبدأ بإضافة منتجاتك.",
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء المتجر. يرجى المحاولة لاحقاً.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6 text-right font-body" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(97,104,240,0.03),transparent)] pointer-events-none" />
      
      <Card className="w-full max-w-xl bg-white border-gray-100 relative z-10 overflow-hidden shadow-2xl rounded-[2.5rem]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="text-center space-y-6 pt-12 pb-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
              <Store className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold font-headline text-gray-900">أهلاً بك في أوج</CardTitle>
            <CardDescription className="text-gray-500 text-lg">أنت على بعد خطوة واحدة من امتلاك متجرك العالمي.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-12 pb-14">
          <form onSubmit={handleCreateStore} className="space-y-10">
            <div className="space-y-4">
              <Label htmlFor="storeName" className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> ما هو اسم متجرك المفضل؟
              </Label>
              <Input 
                id="storeName" 
                placeholder="مثال: متجر الأدب أو كنوز رقمية" 
                required 
                className="bg-gray-50 border-gray-100 h-16 rounded-2xl text-lg font-bold focus:ring-primary/20 transition-all"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="subdomain" className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> اختر رابط متجرك (مجاني للأبد)
              </Label>
              <div className="relative group">
                <Input 
                  id="subdomain" 
                  placeholder="my-store" 
                  required 
                  className={`bg-gray-50 border-gray-100 h-16 pl-32 text-left font-mono text-xl rounded-2xl transition-all ${subdomainAvailable === false ? 'border-destructive ring-destructive/10' : subdomainAvailable === true ? 'border-green-500/50 ring-green-500/10' : 'group-hover:border-primary/30'}`}
                  value={subdomain}
                  onChange={e => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
                    setSubdomain(val);
                    checkSubdomainAvailability(val);
                  }}
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono border-l border-gray-200 pl-4 h-8 flex items-center">
                  .awj.site
                </div>
                {checkingSubdomain && <Loader2 className="absolute left-28 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />}
              </div>
              <div className="min-h-[20px] px-2">
                {subdomainAvailable === true && <p className="text-xs text-green-500 font-bold flex items-center gap-1 animate-in fade-in"><CheckCircle2 className="h-3 w-3" /> متاح! هذا الرابط رائع.</p>}
                {subdomainAvailable === false && <p className="text-xs text-destructive font-bold animate-in shake-in">عذراً، هذا الرابط محجوز بالفعل.</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 bg-primary hover:bg-primary/90 font-bold text-xl rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" 
              disabled={loading || !subdomainAvailable || !storeName}
            >
              {loading ? <Loader2 className="animate-spin ml-3 h-6 w-6" /> : <CheckCircle2 className="ml-3 h-6 w-6" />}
              تأكيد وإنشاء المتجر
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

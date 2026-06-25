
'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Store, Feather, Palette, Search, Globe, Menu, Layout, Info, CreditCard, Truck, Share2, Copy, Check, ShieldCheck, Wallet, BarChart3, Settings2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { getStoreByOwner, getPlatformSettings } from '@/lib/firestore-service';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAIL = 'faleh18511@gmail.com';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (user && db) {
        const [storeData, platformData] = await Promise.all([
          getStoreByOwner(db, user.uid),
          getPlatformSettings(db)
        ]);
        setStore(storeData);
        setPlatformSettings(platformData);
      }
    }
    loadData();
  }, [user, db]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "تم النسخ", description: "تم نسخ الرابط إلى الحافظة." });
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { title: 'الرئيسية', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'المنتجات', icon: Package, path: '/dashboard/products' },
    { title: 'واجهة المتجر', icon: Palette, path: '/dashboard/storefront' },
    { title: 'الطلبات', icon: ShoppingCart, path: '/dashboard/orders' },
    { title: 'المالية', icon: Wallet, path: '/dashboard/earnings' },
    { title: 'خيارات الشحن', icon: Truck, path: '/dashboard/shipping' },
    { title: 'توثيق الحساب', icon: ShieldCheck, path: '/dashboard/verification' },
    { title: 'طرق الدفع', icon: CreditCard, path: '/dashboard/payments' },
    { title: 'إعدادات المتجر', icon: Settings, path: '/dashboard/settings' },
  ];

  const adminItems = [
    { title: 'إدارة المنصة', icon: Settings2, path: '/admin-dashboard' },
    { title: 'إعدادات المنصة العامة', icon: Settings, path: '/admin/platform-settings' },
  ];

  const SidebarNav = () => (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="p-8 mb-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 transition-transform hover:scale-105">
            {platformSettings?.logoUrl ? (
               <img src={platformSettings.logoUrl} className="h-7 w-7 object-contain" alt="Logo" />
            ) : (
               <Feather className="text-white h-7 w-7" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-headline font-bold text-gray-900 tracking-tight leading-none">
              {platformSettings?.siteName || 'أوج'}
            </span>
            <span className="text-[10px] text-primary font-bold tracking-widest uppercase mt-1">منصة المبدعين</span>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const activeClass = isActive ? 'bg-primary/5 text-primary border-primary/10 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent';

          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-4 h-12 px-5 rounded-xl transition-all font-bold text-sm border ${activeClass}`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}

        {store && (
          <div className="pt-6 space-y-1.5">
            <div className="px-5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">واجهة العرض</div>
            <Link 
              href={`/store/${store.subdomain}?preview=true`}
              target="_blank"
              className="flex items-center gap-4 h-12 px-5 rounded-xl transition-all font-bold text-sm border border-transparent text-primary hover:bg-primary/5"
            >
              <ExternalLink className="h-5 w-5" />
              <span>معاينة المتجر المباشر</span>
            </Link>
          </div>
        )}

        {user?.email === ADMIN_EMAIL && (
          <>
            <div className="mt-8 mb-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">الإدارة العامة</div>
            {adminItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-4 h-12 px-5 rounded-xl transition-all font-bold text-sm border ${isActive ? 'bg-slate-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 w-full h-12 px-5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-body" dir="rtl">
      <style jsx global>{`
        :root {
          ${platformSettings?.primaryColor ? `--primary: ${platformSettings.primaryColor};` : ''}
        }
      `}</style>
      <aside className="hidden lg:block w-80 sticky top-0 h-screen z-50">
        <SidebarNav />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-12 w-12 rounded-xl hover:bg-gray-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-80 border-l-0">
                <SidebarNav />
              </SheetContent>
            </Sheet>
            <div className="hidden lg:flex items-center gap-3">
               <div className="w-1 h-6 bg-primary/20 rounded-full"></div>
               <span className="text-gray-400 text-sm font-medium">لوحة تحكم التاجر</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {store && (
               <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary gap-2 rounded-xl font-bold h-12 px-6 shadow-sm transition-all">
                      <Share2 className="h-4 w-4" /> مشاركة المتجر
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white rounded-3xl p-8" dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle className="text-2xl font-bold">مشاركة رابط المتجر</DialogTitle>
                      <DialogDescription className="text-gray-500 mt-2">انسخ الرابط وشاركه مع عملائك لبدء استقبال الطلبات.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 mt-6">
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-900">الرابط المجاني (دائم)</p>
                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <code className="flex-1 font-mono text-sm text-primary truncate">https://{store?.subdomain}.awj.site</code>
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-gray-400 hover:text-primary" onClick={() => copyToClipboard(`https://${store?.subdomain}.awj.site`)}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
               </Dialog>
             )}

             {store && (
               <Link href={`/store/${store.subdomain}`} target="_blank" className="hidden sm:block">
                 <Button variant="ghost" className="hover:bg-primary/5 text-gray-600 gap-2 rounded-xl font-bold h-12 px-4 transition-all">
                   <Store className="h-4 w-4" /> معاينة
                 </Button>
               </Link>
             )}
          </div>
        </header>

        <main className="p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}

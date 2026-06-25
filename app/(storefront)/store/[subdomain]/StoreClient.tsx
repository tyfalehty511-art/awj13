'use client';

import { useState, useMemo } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  LogOut,
  AlertTriangle,
  User,
  ArrowUpRight,
  Box,
  ImageIcon,
  Menu
} from 'lucide-react';
import Link from 'next/link';

const TEMPLATE_CONFIG = {
  modern: { font: 'font-body', weight: 'font-bold', shadow: 'shadow-xl' },
  classic: { font: 'font-body', weight: 'font-medium', shadow: 'shadow-sm' },
  bold: { font: 'font-body', weight: 'font-black', shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]' },
  luxury: { font: 'font-serif', weight: 'font-bold', shadow: 'shadow-md' },
  magazine: { font: 'font-body', weight: 'font-bold', shadow: 'shadow-none border-2' },
  retro: { font: 'font-body', weight: 'font-bold', shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' }
};

const PATTERNS = {
  none: '',
  dots: 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]',
  grid: 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]',
  geometric: 'bg-[linear-gradient(30deg,#f3f4f6_12%,transparent_12.5%,transparent_87%,#f3f4f6_87.5%,#f3f4f6),linear-gradient(150deg,#f3f4f6_12%,transparent_12.5%,transparent_87%,#f3f4f6_87.5%,#f3f4f6),linear-gradient(30deg,#f3f4f6_12%,transparent_12.5%,transparent_87%,#f3f4f6_87.5%,#f3f4f6),linear-gradient(150deg,#f3f4f6_12%,transparent_12.5%,transparent_87%,#f3f4f6_87.5%,#f3f4f6),linear-gradient(60deg,#e5e7eb_25%,transparent_25.5%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(60deg,#e5e7eb_25%,transparent_25.5%,transparent_75%,#e5e7eb_75%,#e5e7eb)] bg-[size:80px_140px]'
};

export default function StoreClient({ store, initialProducts, subdomain }: { store: any, initialProducts: any[], subdomain: string }) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  
  const [products] = useState<any[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  
  const storeMenu = store.navigation_menu || ['الرئيسية'];
  const [activeTab, setActiveTab] = useState(storeMenu[0]);

  const isOwner = user?.uid === store.owner_uid;
  const layoutStyle = store.layout_style || 'grid';
  const templateChoice = (store.template_choice as keyof typeof TEMPLATE_CONFIG) || 'modern';
  const visibleSections = store.visible_sections || ['hero', 'products', 'social'];
  const buttonRadius = store.button_radius ?? 12;
  const animationStyle = store.animation_style || 'fade';
  const backgroundPattern = store.background_pattern || 'none';
  const headerBlur = store.header_blur !== false;
  const logoPulse = !!store.logo_pulse;
  const navMode = store.navigation_mode || 'horizontal';

  const currentTmpl = TEMPLATE_CONFIG[templateChoice];

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(p => {
      const matchesSearch = (p.title?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
      const matchesCategory = activeTab === 'الرئيسية' || p.store_category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab, products]);

  const animationClass = animationStyle === 'fade' ? 'animate-in fade-in duration-1000' : animationStyle === 'slide' ? 'animate-in slide-in-from-bottom-8 duration-700' : '';

  return (
    <div className={`min-h-screen bg-white flex flex-col antialiased text-right ${currentTmpl.font} ${currentTmpl.weight} selection:bg-primary/10`} dir="rtl">
      <style jsx global>{`
        :root {
          --primary: ${store.theme_primary || '#6168F0'};
          --btn-radius: ${buttonRadius}px;
        }
        body { font-family: 'Tajawal', sans-serif; }
        .custom-btn { border-radius: var(--btn-radius) !important; }
      `}</style>

      {/* Admin Toolbar */}
      {isOwner && (
        <div className={`bg-gray-900 text-white py-3 px-4 sm:px-8 flex items-center justify-between sticky z-[100] shadow-2xl ${isPreview ? 'top-[40px]' : 'top-0'}`}>
           <span className="text-[10px] sm:text-xs font-bold opacity-80">أهلاً بك، {store.name}</span>
           <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-[10px] sm:text-xs font-bold gap-2 text-white hover:bg-white/10 rounded-xl h-8">
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" /> لوحة التحكم
              </Button>
           </Link>
        </div>
      )}

      {/* Header */}
      <header className={`border-b border-gray-50 sticky z-50 h-20 sm:h-24 top-0 transition-all ${headerBlur ? 'bg-white/70 backdrop-blur-xl' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
             {(navMode === 'sidebar' || navMode === 'both') && (
               <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 sm:h-12 sm:w-12 text-gray-900">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
               </Button>
             )}
             <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 hidden xs:block" />
          </div>

          <Link href={`/store/${subdomain}`} className={`flex items-center gap-3 shrink-0 group ${logoPulse ? 'logo-pulse' : ''}`}>
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-10 sm:h-14 object-contain transition-transform group-hover:scale-105" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tighter uppercase">{store.name}</span>
            )}
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-50 relative hover:bg-gray-100 transition-colors">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
              <span className="absolute -top-1 -left-1 bg-primary text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-lg">0</span>
            </Button>
          </div>
        </div>
      </header>

      <main className={`flex-1 relative ${PATTERNS[backgroundPattern as keyof typeof PATTERNS]}`}>
        {/* Navigation Tabs */}
        {navMode !== 'sidebar' && (
          <div className="sticky z-40 bg-white/80 backdrop-blur-md border-b border-gray-50 top-[80px] sm:top-[96px]">
            <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-center gap-6 sm:gap-8 py-4 sm:py-5 min-w-max mx-auto">
                {storeMenu.map((label: string) => (
                  <button 
                    key={label}
                    onClick={() => setActiveTab(label)}
                    className={`whitespace-nowrap transition-all font-bold text-xs sm:text-sm uppercase tracking-widest ${
                      activeTab === label 
                      ? 'text-primary border-b-2 border-primary pb-2' 
                      : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        {visibleSections.includes('hero') && activeTab === 'الرئيسية' && (
          <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[850px] flex items-center overflow-hidden justify-center text-center">
             {store.hero_image_url && (
               <div className="absolute inset-0 z-0">
                  <img src={store.hero_image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
               </div>
             )}
             
             <div className="container mx-auto px-4 relative z-10 max-w-4xl">
               <div className={`space-y-6 sm:space-y-10 ${animationClass} ${store.hero_image_url ? 'text-white' : 'text-gray-900'}`}>
                  <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                    {store.brand_headline || store.name}
                  </h1>
                  {store.store_description && (
                    <p className="text-sm sm:text-lg md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto opacity-90">
                      {store.store_description}
                    </p>
                  )}
                  <div className="pt-6 sm:pt-10">
                     <Button className="h-12 sm:h-16 px-8 sm:px-14 text-lg sm:text-xl font-bold custom-btn transition-all hover:scale-105 active:scale-95 bg-primary text-white">
                        تسوق الآن
                     </Button>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        {visibleSections.includes('products') && (
          <section className="container mx-auto px-4 py-12 sm:py-24 mb-10 sm:mb-20">
            <div className="mb-10 sm:mb-16 text-center space-y-3 sm:space-y-4">
               <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">الأكثر مبيعاً</h2>
               <div className="w-10 sm:w-12 h-1 bg-primary mx-auto rounded-full"></div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 sm:py-40 text-center text-gray-300 italic">لا توجد منتجات حالياً.</div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12">
                {filteredProducts.map((p) => (
                  <Link key={p.id} href={`/store/${subdomain}/product/${p.id}${isPreview ? '?preview=true' : ''}`} className="group">
                    <div className="bg-white border border-gray-50 overflow-hidden hover:shadow-2xl transition-all duration-700 flex flex-col rounded-[2rem] h-full">
                      <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-100"><Box className="h-10 w-10 sm:h-20 sm:w-20" /></div>
                        )}
                      </div>
                      <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between text-center">
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-lg line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
                          <p className="text-base sm:text-xl font-bold font-mono text-gray-900">
                             {Number(p.price).toLocaleString('ar-SA')} <span className="text-[10px] sm:text-xs">ر.س</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white py-12 sm:py-24">
        <div className="container mx-auto px-4 text-center space-y-6 sm:space-y-10">
           <p className="text-2xl sm:text-4xl font-bold text-gray-900 uppercase tracking-tighter">{store.name}</p>
           <nav className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-widest">
              <Link href="#" className="hover:text-gray-900">اتصل بنا</Link>
              <Link href="#" className="hover:text-gray-900">سياسة الاسترجاع</Link>
              <Link href="#" className="hover:text-gray-900">الخصوصية</Link>
           </nav>
           <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} {store.name} — جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

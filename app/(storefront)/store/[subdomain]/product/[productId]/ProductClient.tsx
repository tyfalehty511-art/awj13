
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight, Download, BookOpen, Package, CheckCircle2, ShieldCheck, Smartphone, CreditCard, Loader2, Wrench, AlertTriangle, Search, Globe, User, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { createPendingOrder } from '@/lib/firestore-service';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

const STYLE_PRESETS = {
  modern: { shadow: 'shadow-xl' },
  classic: { shadow: 'shadow-sm' },
  bold: { shadow: 'shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]' }
};

export default function ProductClient({ store, product, subdomain }: { store: any, product: any, subdomain: string }) {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const isOwner = user?.uid === store.owner_uid;

  const [checkingOut, setCheckingOut] = useState(false);

  const templateChoice = (store.template_choice as keyof typeof STYLE_PRESETS) || 'modern';
  const buttonRadius = store.button_radius ?? 12;
  const currentStyle = STYLE_PRESETS[templateChoice];

  const handlePurchase = async () => {
    if (isPreview || isOwner) {
      toast({
        title: "عملية محظورة",
        description: "أنت في وضع المعاينة أو صاحب المتجر. الشراء معطل حالياً.",
      });
      return;
    }

    if (!db || !store || !product) return;
    setCheckingOut(true);
    try {
      const orderDoc = await createPendingOrder(db, store.id, { 
        total: product.price, 
        items: [{ ...product, quantity: 1 }],
        type: product.type,
        customer_name: 'عميل أوج',
        store_id: store.id,
        is_digital: product.type !== 'physical'
      });
      
      router.push(`/checkout?type=product_order&id=${orderDoc.id}&storeId=${store.id}`);
    } catch (err) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء بدء عملية الشراء.", variant: "destructive" });
      setCheckingOut(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased text-right font-body" dir="rtl">
      <style jsx global>{`
        :root {
          --primary: ${store.theme_primary || '#6168F0'};
          --accent: ${store.theme_accent || '#6BCEF5'};
          --btn-radius: ${buttonRadius}px;
        }
        .custom-btn {
          border-radius: var(--btn-radius) !important;
        }
      `}</style>

      {/* Admin Toolbar */}
      {isOwner && (
        <div className={`bg-gray-900 text-white py-3 px-8 flex items-center justify-between sticky z-[60] shadow-2xl ${isPreview ? 'top-[40px]' : 'top-0'}`}>
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold opacity-80">أهلاً بك، {store.name}</span>
           </div>
           <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-xl font-bold">لوحة التحكم</Button>
              </Link>
           </div>
        </div>
      )}

      <header className={`border-b border-gray-50 bg-white/80 backdrop-blur-md sticky z-50 h-20 ${isPreview ? (isOwner ? 'top-[96px]' : 'top-[40px]') : (isOwner ? 'top-[56px]' : 'top-0')}`}>
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href={`/store/${subdomain}${isPreview ? '?preview=true' : ''}`} className="flex items-center gap-3 transition-all hover:translate-x-1">
             <ArrowRight className="h-5 w-5 text-gray-400" />
             <span className="text-sm font-bold text-gray-500">العودة للمتجر</span>
          </Link>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-gray-900">{store.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="space-y-8 sticky top-32">
            <div className={`aspect-square bg-gray-50 rounded-[3rem] flex items-center justify-center overflow-hidden border border-gray-100 ${currentStyle.shadow}`}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <Package className="h-32 w-32 text-gray-200" />
              )}
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-none px-5 py-2 rounded-full text-xs font-bold">
                {product.type === 'physical' ? 'منتج جاهز' : 'منتج رقمي'}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">{product.title}</h1>
            </div>

            <div className="text-6xl font-bold text-primary font-mono tracking-tighter">
              {Number(product.price).toLocaleString('ar-SA')} <span className="text-3xl font-body">ر.س</span>
            </div>

            <p className="text-gray-500 text-xl leading-relaxed whitespace-pre-wrap font-medium">{product.description}</p>

            <div className="pt-10 border-t border-gray-100 space-y-10">
               <Button 
                 onClick={handlePurchase} 
                 disabled={checkingOut} 
                 className={`w-full h-20 text-2xl font-bold custom-btn ${currentStyle.shadow} transition-all hover:scale-[1.02] ${isPreview || isOwner ? 'bg-orange-500' : 'bg-primary hover:bg-primary/90'}`}
               >
                 {checkingOut ? <Loader2 className="animate-spin ml-2" /> : <ShoppingCart className="ml-2 h-7 w-7" />}
                 {isPreview || isOwner ? "وضعية المعاينة" : "اشترِ المنتج الآن"}
               </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { getStoreByOwner, deleteProduct } from '@/lib/firestore-service';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  Package, 
  Download, 
  CreditCard, 
  Wrench,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [store, setStore] = useState<any>(null);
  const [storeLoading, setStoreLoading] = useState(true);

  // Fetch store first
  useEffect(() => {
    async function loadStore() {
      if (!user || !db) return;
      try {
        const storeData = await getStoreByOwner(db, user.uid);
        if (storeData) {
          setStore(storeData);
        } else {
          // If no store, redirect to dashboard to show onboarding
          router.push('/dashboard');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setStoreLoading(false);
      }
    }
    loadStore();
  }, [user, db, router]);

  // Use real-time collection hook for products
  const productsQuery = useMemo(() => {
    if (!db || !store) return null;
    return query(collection(db, 'stores', store.id, 'products'), orderBy('createdAt', 'desc'));
  }, [db, store]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await deleteProduct(db!, store.id, id);
      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح." });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حذف المنتج.", variant: "destructive" });
    }
  };

  if (storeLoading || productsLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-gray-400 font-bold">جاري تحميل منتجاتك...</p>
    </div>
  );

  return (
    <div className="space-y-10 text-right animate-in fade-in duration-500" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-gray-900 flex items-center gap-3">
            المنتجات
            <Badge variant="outline" className="text-xs font-mono bg-white">{products.length}</Badge>
          </h1>
          <p className="text-muted-foreground text-lg italic">إدارة المخزون، الأسعار، وعروضك الرقمية في مكان واحد.</p>
        </div>
        
        {/* Main Add Product Button - Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 h-16 px-10 rounded-[1.5rem] font-bold text-lg gap-3 group transition-all hover:scale-105 active:scale-95">
              <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              إضافة منتج جديد
              <ChevronDown className="h-5 w-5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-white border-gray-100 rounded-3xl shadow-2xl p-3 animate-in zoom-in-95 duration-200">
            <DropdownMenuLabel className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest p-4 pb-2">اختر طبيعة المنتج</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-50" />
            
            <DropdownMenuItem asChild>
              <Link href="/dashboard/products/new?type=physical" className="flex items-center justify-end gap-4 p-4 rounded-2xl cursor-pointer hover:bg-primary/5 text-gray-700 font-bold group transition-colors">
                <div className="text-right">
                  <p className="text-sm">منتج جاهز</p>
                  <p className="text-[10px] text-gray-400 font-normal">شحن وتوصيل مادي</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package className="h-5 w-5" />
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/dashboard/products/new?type=digital" className="flex items-center justify-end gap-4 p-4 rounded-2xl cursor-pointer hover:bg-primary/5 text-gray-700 font-bold group transition-colors">
                <div className="text-right">
                  <p className="text-sm">منتج رقمي</p>
                  <p className="text-[10px] text-gray-400 font-normal">تحميل فوري للملفات</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Download className="h-5 w-5" />
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/dashboard/products/new?type=voucher" className="flex items-center justify-end gap-4 p-4 rounded-2xl cursor-pointer hover:bg-primary/5 text-gray-700 font-bold group transition-colors">
                <div className="text-right">
                  <p className="text-sm">بطاقة رقمية</p>
                  <p className="text-[10px] text-gray-400 font-normal">أكواد شحن واشتراكات</p>
                </div>
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <CreditCard className="h-5 w-5" />
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/dashboard/products/new?type=service" className="flex items-center justify-end gap-4 p-4 rounded-2xl cursor-pointer hover:bg-primary/5 text-gray-700 font-bold group transition-colors">
                <div className="text-right">
                  <p className="text-sm">خدمة رقمية</p>
                  <p className="text-[10px] text-gray-400 font-normal">استشارات وخدمات مخصصة</p>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Wrench className="h-5 w-5" />
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Section */}
      <div className="rounded-[2.5rem] border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100 h-16">
              <TableHead className="text-right p-6 font-bold text-gray-900">المنتج المعروض</TableHead>
              <TableHead className="text-right p-6 font-bold text-gray-900">التصنيف</TableHead>
              <TableHead className="text-right p-6 font-bold text-gray-900">السعر</TableHead>
              <TableHead className="text-right p-6 font-bold text-gray-900">الحالة</TableHead>
              <TableHead className="text-left p-6 font-bold text-gray-900">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-40 space-y-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary/30 relative">
                       <Package className="h-12 w-12" />
                       <div className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-sm"><Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" /></div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-2xl font-bold text-gray-900">متجرك فارغ حالياً</p>
                       <p className="text-gray-400 max-w-sm mx-auto">ابدأ بإضافة أول منتج لك لتبدأ في جني الأرباح عبر منصة أوج.</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-gray-900 hover:bg-black text-white px-8 h-14 rounded-2xl font-bold gap-2">
                          <Plus className="h-5 w-5" /> أضف منتجك الأول الآن
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-64 bg-white border-gray-100 rounded-2xl shadow-xl p-2">
                         <DropdownMenuItem asChild>
                           <Link href="/dashboard/products/new?type=physical" className="p-4 rounded-xl cursor-pointer hover:bg-primary/5 font-bold text-right flex justify-end gap-2">منتج جاهز <Package className="h-4 w-4" /></Link>
                         </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                           <Link href="/dashboard/products/new?type=digital" className="p-4 rounded-xl cursor-pointer hover:bg-primary/5 font-bold text-right flex justify-end gap-2">منتج رقمي <Download className="h-4 w-4" /></Link>
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-primary/[0.01] border-gray-50 h-24 transition-colors group">
                  <TableCell className="p-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-primary border border-gray-100 shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          p.type === 'digital' ? <Download className="h-6 w-6" /> : p.type === 'voucher' ? <CreditCard className="h-6 w-6" /> : p.type === 'service' ? <Wrench className="h-6 w-6" /> : <Package className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{p.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">ID: {p.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-6">
                    <Badge variant="outline" className="text-[10px] px-3 py-1.5 bg-gray-50/50 border-gray-100 text-gray-500 rounded-xl font-bold">
                      {p.type === 'digital' ? 'منتج رقمي' : p.type === 'voucher' ? 'بطاقة رقمية' : p.type === 'service' ? 'خدمة رقمية' : 'منتج جاهز'}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-6 font-bold font-mono text-primary text-xl">
                    {Number(p.price).toLocaleString('ar-SA')} <span className="text-xs font-body font-normal text-gray-400">ر.س</span>
                  </TableCell>
                  <TableCell className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-sm font-bold text-green-600">معروض</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-6 text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-gray-100 transition-all">
                          <MoreHorizontal className="h-6 w-6 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-gray-100 rounded-2xl shadow-2xl text-right p-2 w-56">
                        <DropdownMenuItem className="flex items-center justify-end gap-3 p-4 rounded-xl cursor-pointer hover:bg-primary/5 font-bold" asChild>
                           <Link href={`/store/${store?.subdomain}/product/${p.id}`} target="_blank">
                             معاينة في المتجر <ExternalLink className="h-4 w-4" />
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-50" />
                        <DropdownMenuItem 
                          className="flex items-center justify-end gap-3 p-4 rounded-xl text-red-500 cursor-pointer hover:bg-red-50 font-bold"
                          onClick={() => handleDelete(p.id)}
                        >
                          حذف المنتج نهائياً <Trash2 className="h-4 w-4" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

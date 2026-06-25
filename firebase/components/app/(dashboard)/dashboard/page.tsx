
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { getStoreByOwner, getRecentOrders, getTransactions, updateStoreSettings } from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, TrendingUp, Loader2, ArrowUpRight, PlusCircle, CreditCard, Rocket, CheckCircle2, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function DashboardOverview() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [stats, setStats] = useState([
    { title: 'إجمالي المبيعات', value: '0.00 ر.س', icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
    { title: 'صافي أرباحك (91%)', value: '0.00 ر.س', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { title: 'الطلبات', value: '0', icon: ShoppingCart, color: 'bg-purple-50 text-primary' },
    { title: 'رسوم أوج (9%)', value: '0.00 ر.س', icon: CreditCard, color: 'bg-orange-50 text-orange-600' },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user || !db) return;
      
      try {
        const storeData = await getStoreByOwner(db, user.uid);
        if (!storeData) {
          setStore(null);
          setLoading(false);
          return;
        }

        setStore(storeData);
        const [orders, transactions] = await Promise.all([
          getRecentOrders(db, storeData.id),
          getTransactions(db, storeData.id)
        ]);

        const totalRevenue = transactions.reduce((sum, t: any) => sum + (t.total_amount || 0), 0);
        const merchantBalance = transactions.reduce((sum, t: any) => sum + (t.merchant_balance || 0), 0);
        const awjFees = transactions.reduce((sum, t: any) => sum + (t.awj_commission || 0), 0);

        setStats([
          { title: 'إجمالي المبيعات', value: `${totalRevenue.toLocaleString('ar-SA')} ر.س`, icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
          { title: 'صافي أرباحك (91%)', value: `${merchantBalance.toLocaleString('ar-SA')} ر.س`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { title: 'الطلبات', value: orders.length.toString(), icon: ShoppingCart, color: 'bg-purple-50 text-primary' },
          { title: 'رسوم أوج (9%)', value: `${awjFees.toLocaleString('ar-SA')} ر.س`, icon: CreditCard, color: 'bg-orange-50 text-orange-600' },
        ]);
        
        setRecentOrders(orders);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchDashboardData();
  }, [user, db]);

  const handleLaunchStore = async () => {
    if (!store?.custom_domain && !store?.subdomain) {
      toast({ title: "متطلب ناقص", description: "يجب إعداد رابط للمتجر أولاً.", variant: "destructive" });
      return;
    }
    setLaunching(true);
    try {
      await updateStoreSettings(db!, store.id, { status: 'live', launchedAt: new Date().toISOString() });
      setStore({ ...store, status: 'live' });
      toast({ title: "تم الإطلاق!", description: "متجرك الآن متاح للعالم عبر الرابط الخاص بك." });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل إطلاق المتجر.", variant: "destructive" });
    } finally {
      setLaunching(false);
    }
  };

  if (authLoading || loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary h-8 w-8" />
    </div>
  );

  if (!store) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary">
          <PlusCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">لم تقم بإنشاء متجر بعد</h2>
          <p className="text-gray-500 max-w-md">ابدأ الآن بتسمية متجرك واختيار الرابط الخاص بك لتبدأ في جني الأرباح.</p>
        </div>
        <Link href="/onboarding">
          <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold px-10 h-14 rounded-2xl shadow-lg shadow-primary/20">
            إنشاء متجر الآن
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-gray-900 flex items-center gap-3">
             أهلاً بك، {store.name} 
             {store.status === 'live' && <Badge className="bg-green-50 text-green-600 border-none font-bold">مباشر الآن</Badge>}
          </h1>
          <p className="text-gray-500">إليك أحدث الإحصائيات والأداء لمتجرك اليوم.</p>
        </div>
        
        {store.status !== 'live' ? (
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleLaunchStore}
              disabled={launching}
              className="h-14 px-8 bg-primary hover:bg-primary/90 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-3 group"
            >
              {launching ? <Loader2 className="animate-spin h-5 w-5" /> : <Rocket className="h-5 w-5 group-hover:animate-bounce" />}
              إطلاق المتجر المباشر
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
             <CheckCircle2 className="h-6 w-6 text-green-600" />
             <div>
               <p className="text-xs font-bold text-green-900">متجرك يعمل بنجاح</p>
               <p className="text-[10px] text-green-700 font-mono" dir="ltr">{store.custom_domain || `${store.subdomain}.awj.site`}</p>
             </div>
          </div>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-gray-100 shadow-sm bg-white overflow-hidden group hover:border-primary/20 transition-all rounded-[2rem]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.icon === DollarSign ? 'bg-blue-50 text-blue-600' : stat.icon === TrendingUp ? 'bg-green-50 text-green-600' : stat.icon === ShoppingCart ? 'bg-purple-50 text-primary' : 'bg-orange-50 text-orange-600'}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="ghost" className="text-gray-400 font-bold text-[10px] tracking-widest uppercase">اليوم</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <div className="text-2xl font-bold text-gray-900 font-mono">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 border-gray-100 shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
          <CardHeader className="border-b border-gray-50 bg-gray-50/30 p-8">
            <CardTitle className="text-lg font-bold">أحدث المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <div className="p-20 text-center text-gray-400 italic">لا توجد مبيعات بعد. أطلق متجرك وشارك الرابط!</div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                          <Package className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">طلب #{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs text-gray-400">
                            {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString('ar-EG') : 'الآن'}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-primary font-mono">{order.total?.toLocaleString('ar-SA')} ر.س</div>
                        <Badge className={`text-[10px] border-none px-3 mt-1 ${order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                          {order.status === 'completed' ? 'مكتمل' : 'مدفوع'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
          <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
            <CardTitle className="text-lg font-bold">توزيع الأرباح الصافية</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-900">أرباحك كمنشئ</span>
                  <span className="text-green-600">91%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '91%' }} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-900">عمولة أوج</span>
                  <span className="text-primary">9%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '9%' }} />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Globe className="h-4 w-4" />
                <span>نصيحة أوج</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                المنتجات الرقمية والكتب تحقق مبيعات أسرع لأن العميل يحصل عليها فوراً، وبدون تكاليف شحن!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

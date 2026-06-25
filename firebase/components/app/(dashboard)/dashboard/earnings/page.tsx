'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { getStoreByOwner, getTransactions, getWithdrawalRequests, updateStoreSettings } from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Loader2, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Landmark,
  User,
  ShieldCheck,
  Save,
  Info,
  DollarSign,
  Percent
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EarningsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountHolder: '',
    iban: ''
  });

  // Calculations
  const grossSales = useMemo(() => transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0), [transactions]);
  const platformFee = useMemo(() => grossSales * 0.09, [grossSales]);
  const netProfit = useMemo(() => grossSales - platformFee, [grossSales, platformFee]);

  useEffect(() => {
    async function loadData() {
      if (!user || !db) return;
      try {
        const storeData = await getStoreByOwner(db, user.uid);
        if (storeData) {
          setStore(storeData);
          if (storeData.bank_info) {
            setBankInfo(storeData.bank_info);
          }
          const transData = await getTransactions(db, storeData.id);
          setTransactions(transData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, db]);

  const handleSaveBankInfo = async () => {
    if (!store || !db) return;
    setSavingBank(true);
    try {
      await updateStoreSettings(db, store.id, { bank_info: bankInfo });
      toast({ title: "تم الحفظ", description: "تم تحديث البيانات البنكية بنجاح." });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حفظ البيانات البنكية.", variant: "destructive" });
    } finally {
      setSavingBank(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-10 text-right animate-in fade-in duration-500 font-body" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">المالية والأرباح</h1>
          <p className="text-gray-500">تتبع مبيعاتك، أرباحك الصافية، وقم بإدارة بيانات الصرف البنكي.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem] border border-gray-100">
          <CardContent className="p-8 space-y-4">
             <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-xl"><DollarSign className="h-6 w-6" /></div>
             <div className="space-y-1">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">إجمالي المبيعات</p>
               <p className="text-3xl font-bold text-gray-900 font-mono">{grossSales.toLocaleString('ar-SA')} ر.س</p>
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem] border border-gray-100">
          <CardContent className="p-8 space-y-4">
             <div className="p-3 bg-orange-50 text-orange-600 w-fit rounded-xl"><Percent className="h-6 w-6" /></div>
             <div className="space-y-1">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">عمولة أوج (9%)</p>
               <p className="text-3xl font-bold text-gray-900 font-mono">{platformFee.toLocaleString('ar-SA')} ر.س</p>
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden rounded-[2rem]">
          <CardContent className="p-8 space-y-4">
             <div className="p-3 bg-white/20 text-white w-fit rounded-xl"><Wallet className="h-6 w-6" /></div>
             <div className="space-y-1">
               <p className="text-xs font-bold opacity-80 uppercase tracking-widest">الرصيد المتاح للسحب</p>
               <p className="text-3xl font-bold font-mono">{netProfit.toLocaleString('ar-SA')} ر.س</p>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Payout Settings */}
        <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-50 pb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Landmark className="h-6 w-6 text-primary" /> إعدادات الصرف
            </h2>
            <Button 
              onClick={handleSaveBankInfo} 
              disabled={savingBank}
              className="bg-primary hover:bg-primary/90 rounded-xl h-10 px-6 font-bold gap-2"
            >
              {savingBank ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ البيانات البنكية
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">اسم البنك</Label>
                <Input 
                  placeholder="مثال: مصرف الراجحي" 
                  value={bankInfo.bankName}
                  onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})}
                  className="h-14 bg-gray-50 border-transparent rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">اسم صاحب الحساب</Label>
                <Input 
                  placeholder="الاسم كما في البنك" 
                  value={bankInfo.accountHolder}
                  onChange={e => setBankInfo({...bankInfo, accountHolder: e.target.value})}
                  className="h-14 bg-gray-50 border-transparent rounded-2xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">رقم الآيبان (IBAN)</Label>
              <Input 
                placeholder="SA00 0000 0000 0000 0000 0000" 
                value={bankInfo.iban}
                onChange={e => setBankInfo({...bankInfo, iban: e.target.value.toUpperCase()})}
                className="h-14 bg-gray-50 border-transparent rounded-2xl font-mono text-lg"
                dir="ltr"
              />
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 items-start">
               <ShieldCheck className="h-5 w-5 text-primary mt-1 shrink-0" />
               <p className="text-xs text-gray-500 leading-relaxed">
                 يتم تحويل الأرباح تلقائياً إلى حسابك المسجل عند وصول رصيدك للحد الأدنى (50 ر.س). تأكد من صحة الآيبان لتجنب تأخير الحوالات.
               </p>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="border-gray-100 shadow-sm bg-gray-900 text-white rounded-[2.5rem] p-10 flex flex-col justify-center space-y-6">
           <div className="space-y-2">
              <h3 className="text-2xl font-bold">نظام دفع آمن 100%</h3>
              <p className="text-gray-400 leading-relaxed">
                تستخدم أوج تقنيات تشفير Stripe العالمية لمعالجة المدفوعات. يتم اقتطاع عمولة المنصة (9%) لتغطية تكاليف بوابات الدفع، الاستضافة، والدعم الفني، مما يضمن لك تجربة بيع دون توقف.
              </p>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase">يوم الصرف</span>
                <span className="font-bold">كل أسبوع (الاثنين)</span>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase">الحد الأدنى</span>
                <span className="font-bold">50.00 ر.س</span>
              </div>
           </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <History className="h-5 w-5 text-primary" /> آخر العمليات المالية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="h-16">
                <TableHead className="text-right p-6 font-bold text-gray-900">التاريخ</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">العميل</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">المنتج</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">المبلغ</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-gray-400 italic">لا توجد عمليات مسجلة حتى الآن.</TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id} className="border-gray-50 h-20 hover:bg-gray-50/30 transition-colors">
                    <TableCell className="p-6 text-gray-500 font-mono">
                      {t.createdAt?.toDate ? new Date(t.createdAt.toDate()).toLocaleDateString('ar-SA') : 'الآن'}
                    </TableCell>
                    <TableCell className="p-6">
                       <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-gray-400" />
                         <span className="font-bold text-gray-700">{t.customer_name || 'عميل أوج'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="p-6 text-gray-600 font-medium">مبيعات متجر</TableCell>
                    <TableCell className="p-6 font-bold font-mono text-primary">
                      {Number(t.total_amount).toFixed(2)} ر.س
                    </TableCell>
                    <TableCell className="p-6">
                      <Badge className="bg-green-50 text-green-600 border-none px-4 py-1 font-bold">مكتملة</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

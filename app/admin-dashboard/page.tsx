'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { 
  getAllStoresForVerification, 
  updateVerificationStatus, 
  getAllWithdrawalRequests, 
  updateWithdrawalStatus,
  getPlatformSettings,
  updatePlatformSettings,
  getAllDomainRequests,
  updateDomainRequestStatus,
  getAllTransactionsForAdmin,
  finalizeDomainMapping
} from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Wallet, 
  Clock, 
  Landmark, 
  Settings, 
  ImageIcon, 
  Bell, 
  Save, 
  Globe, 
  Copy, 
  Tag, 
  Percent, 
  TrendingUp, 
  CreditCard,
  Layers,
  Check,
  Zap,
  LogOut,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADMIN_EMAIL = 'faleh18511@gmail.com';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [stores, setStores] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [domainRequests, setDomainRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDomainMappingDialogOpen, setIsDomainMappingDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string, type: 'store' | 'withdrawal' | 'domain', storeId?: string, currentDomain?: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [finalDomain, setFinalDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'أوج',
    logoUrl: '',
    primaryColor: '#6168F0',
    announcementText: '',
    announcementActive: false,
    copyrightText: '© 2024 أوج — جميع الحقوق محفوظة.',
    domainProfitMargin: 15,
    platformFee: 9,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Financial Stats Calculation
  const stats = useMemo(() => {
    const productCommissions = transactions
      .filter(t => t.transaction_type === 'PRODUCT_SALE')
      .reduce((sum, t) => sum + (t.awj_commission || 0), 0);
    
    const serviceSales = transactions
      .filter(t => t.transaction_type === 'SERVICE_PURCHASE')
      .reduce((sum, t) => sum + (t.total_amount || 0), 0);
    
    const merchantVolume = transactions
      .filter(t => t.transaction_type === 'PRODUCT_SALE')
      .reduce((sum, t) => sum + (t.total_amount || 0), 0);

    const pendingWithdrawals = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    return {
      productCommissions,
      serviceSales,
      totalPlatformRevenue: productCommissions + serviceSales,
      merchantVolume,
      pendingWithdrawals
    };
  }, [transactions, withdrawals]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        toast({ title: "وصول مرفوض", description: "ليس لديك صلاحيات الوصول لهذه الصفحة.", variant: "destructive" });
        router.push('/login');
        return;
      }
    }

    async function loadAllData() {
      if (!db || !user || user.email !== ADMIN_EMAIL) return;
      try {
        const [storesData, withdrawalsData, settingsData, domainsData, transData] = await Promise.all([
          getAllStoresForVerification(db),
          getAllWithdrawalRequests(db),
          getPlatformSettings(db),
          getAllDomainRequests(db),
          getAllTransactionsForAdmin(db)
        ]);
        setStores(storesData);
        setWithdrawals(withdrawalsData);
        setDomainRequests(domainsData);
        setTransactions(transData);
        if (settingsData) {
          setPlatformSettings(prev => ({ 
            ...prev, 
            ...settingsData,
            domainProfitMargin: typeof settingsData.domainProfitMargin === 'number' ? settingsData.domainProfitMargin : 15,
            platformFee: typeof settingsData.platformFee === 'number' ? settingsData.platformFee : 9
          }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [user, authLoading, db, router, toast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تسجيل الخروج.", variant: "destructive" });
    }
  };

  const handleApproveStore = async (storeId: string) => {
    if (!db) return;
    try {
      await updateVerificationStatus(db, storeId, 'verified');
      toast({ title: "تم التوثيق", description: "المتجر الآن موثق رسمياً." });
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, verification_status: 'verified' } : s));
    } catch (error) {
      toast({ title: "خطأ", description: "فشل التحديث.", variant: "destructive" });
    }
  };

  const handleApproveWithdrawal = async (storeId: string, withdrawalId: string) => {
    if (!db) return;
    try {
      await updateWithdrawalStatus(db, storeId, withdrawalId, 'approved');
      toast({ title: "تم الاعتماد", description: "تم تأكيد طلب السحب بنجاح." });
      setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? { ...w, status: 'approved' } : w));
    } catch (error) {
      toast({ title: "خطأ", description: "فشل العملية.", variant: "destructive" });
    }
  };

  const handleActivateDomain = async () => {
    if (!db || !selectedItem || !finalDomain) return;
    setSubmitting(true);
    try {
      await finalizeDomainMapping(db, selectedItem.id, selectedItem.storeId!, finalDomain);
      toast({ title: "تم التفعيل", description: "تم تفعيل الدومين المخصص وربطه بالمتجر بنجاح." });
      setDomainRequests(prev => prev.map(d => d.id === selectedItem.id ? { ...d, status: 'completed', final_domain: finalDomain } : d));
      setIsDomainMappingDialogOpen(false);
      setFinalDomain('');
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تفعيل الدومين.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = (id: string, type: 'store' | 'withdrawal' | 'domain', storeId?: string) => {
    setSelectedItem({ id, type, storeId });
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!db || !selectedItem || !rejectReason) return;
    setSubmitting(true);
    try {
      if (selectedItem.type === 'store') {
        await updateVerificationStatus(db, selectedItem.id, 'rejected', rejectReason);
        setStores(prev => prev.map(s => s.id === selectedItem.id ? { ...s, verification_status: 'rejected' } : s));
      } else if (selectedItem.type === 'withdrawal') {
        await updateWithdrawalStatus(db, selectedItem.storeId!, selectedItem.id, 'rejected', rejectReason);
        setWithdrawals(prev => prev.map(w => w.id === selectedItem.id ? { ...w, status: 'rejected', reason: rejectReason } : w));
      } else if (selectedItem.type === 'domain') {
        await updateDomainRequestStatus(db, selectedItem.id, 'rejected');
        setDomainRequests(prev => prev.map(d => d.id === selectedItem.id ? { ...d, status: 'rejected' } : d));
      }
      toast({ title: "تم الرفض", description: "تم تحديث الحالة بنجاح." });
      setIsRejectDialogOpen(false);
      setRejectReason('');
    } catch (error) {
      toast({ title: "خطأ", description: "فشل إتمام الرفض.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!db) return;
    setSavingSettings(true);
    try {
      await updatePlatformSettings(db, platformSettings);
      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات المنصة بنجاح." });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات.", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center bg-[#0F1115]"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-[#0F1115] text-white font-body pb-20 text-right" dir="rtl">
      <header className="sticky top-0 z-50 bg-[#16191F]/80 backdrop-blur-md border-b border-white/5 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"><ShieldCheck className="h-6 w-6 text-white" /></div>
          <div><h1 className="text-xl font-bold">لوحة تحكم المشرف</h1><p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">فالح - المدير العام</p></div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 gap-2 font-bold h-12 px-6 rounded-xl transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 space-y-12">
        {/* Statistics Header */}
        <div className="grid gap-6 md:grid-cols-4">
           <Card className="bg-[#16191F] border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="p-3 bg-primary/20 text-primary rounded-xl"><TrendingUp className="h-6 w-6" /></div>
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">إجمالي أرباح المنصة</p>
                 <p className="text-3xl font-bold font-mono text-primary mt-1">{stats.totalPlatformRevenue.toLocaleString('ar-SA')} <span className="text-xs">ر.س</span></p>
              </div>
           </Card>

           <Card className="bg-[#16191F] border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Percent className="h-6 w-6" /></div>
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">عمولات المنتجات ({platformSettings.platformFee}%)</p>
                 <p className="text-3xl font-bold font-mono text-blue-500 mt-1">{stats.productCommissions.toLocaleString('ar-SA')} <span className="text-xs">ر.س</span></p>
              </div>
           </Card>

           <Card className="bg-[#16191F] border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><Layers className="h-6 w-6" /></div>
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">مبيعات الخدمات (الدومينات)</p>
                 <p className="text-3xl font-bold font-mono text-purple-500 mt-1">{stats.serviceSales.toLocaleString('ar-SA')} <span className="text-xs">ر.س</span></p>
              </div>
           </Card>

           <Card className="bg-[#16191F] border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl"><Clock className="h-6 w-6" /></div>
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">سحوبات قيد الانتظار</p>
                 <p className="text-3xl font-bold font-mono text-orange-500 mt-1">{stats.pendingWithdrawals.toLocaleString('ar-SA')} <span className="text-xs">ر.س</span></p>
              </div>
           </Card>
        </div>

        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-16 bg-[#16191F] border border-white/5 rounded-2xl p-2 mb-10">
            <TabsTrigger value="verification" className="rounded-xl font-bold data-[state=active]:bg-primary">توثيق المتاجر</TabsTrigger>
            <TabsTrigger value="withdrawals" className="rounded-xl font-bold data-[state=active]:bg-primary">سحب الأرباح</TabsTrigger>
            <TabsTrigger value="domains" className="rounded-xl font-bold data-[state=active]:bg-primary">طلبات الدومين</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl font-bold data-[state=active]:bg-primary">إعدادات المنصة</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="animate-in fade-in duration-500">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-primary" /> طلبات التوثيق المعلقة</h2>
              <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="text-right p-6 font-bold">المتجر / المالك</TableHead>
                      <TableHead className="text-right p-6 font-bold">المرفقات</TableHead>
                      <TableHead className="text-right p-6 font-bold">الحالة</TableHead>
                      <TableHead className="text-left p-6 font-bold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stores.filter(s => s.verification_status === 'pending').map((store) => (
                      <TableRow key={store.id} className="border-white/5">
                        <TableCell className="p-6">
                          <div className="font-bold">{store.name}</div>
                          <div className="text-xs text-gray-500">{store.verification_details?.fullNameAr}</div>
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="bg-white/5 rounded-xl h-10" asChild><a href={store.verification_details?.idUrl} target="_blank"><FileText className="h-4 w-4 ml-2" /> الهوية</a></Button>
                            <Button size="sm" variant="ghost" className="bg-white/5 rounded-xl h-10" asChild><a href={store.verification_details?.docUrl} target="_blank"><ExternalLink className="h-4 w-4 ml-2" /> الوثيقة</a></Button>
                          </div>
                        </TableCell>
                        <TableCell className="p-6"><Badge className="bg-orange-500/10 text-orange-500 border-none">قيد المراجعة</Badge></TableCell>
                        <TableCell className="p-6 text-left">
                          <div className="flex justify-end gap-3">
                            <Button className="bg-green-600 rounded-xl h-10 px-6 font-bold" onClick={() => handleApproveStore(store.id)}>اعتماد</Button>
                            <Button variant="destructive" className="rounded-xl h-10 px-6 font-bold" onClick={() => handleRejectClick(store.id, 'store')}>رفض</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="withdrawals" className="animate-in fade-in duration-500">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3"><Wallet className="h-6 w-6 text-primary" /> نظام سحب الأرباح</h2>
              <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="text-right p-6 font-bold">التاجر / المتجر</TableHead>
                      <TableHead className="text-right p-6 font-bold">المبلغ / الآيبان</TableHead>
                      <TableHead className="text-right p-6 font-bold">الحالة</TableHead>
                      <TableHead className="text-left p-6 font-bold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id} className="border-white/5 h-24">
                        <TableCell className="p-6">
                          <div className="font-bold">UID: {w.ownerUid?.slice(0, 8)}</div>
                          <div className="text-xs text-gray-500">متجر: {w.store_id}</div>
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="text-xl font-bold text-primary font-mono">{Number(w.amount).toFixed(2)} ر.س</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-2">
                             <Landmark className="h-3 w-3" /> {w.iban}
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                          <Badge className={`${w.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'} border-none`}>
                            {w.status === 'approved' ? 'معتمد' : 'قيد المراجعة'}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-6 text-left">
                          <div className="flex justify-end gap-3">
                            {w.status === 'pending' && (
                              <>
                                <Button className="bg-green-600 rounded-xl h-10 px-6 font-bold" onClick={() => handleApproveWithdrawal(w.store_id, w.id)}>اعتماد</Button>
                                <Button variant="destructive" className="rounded-xl h-10 px-6 font-bold" onClick={() => handleRejectClick(w.id, 'withdrawal', w.store_id)}>رفض</Button>
                              </>
                            )}
                            {w.status === 'approved' && (
                              <Button variant="ghost" className="h-10 px-4 text-primary font-bold" onClick={() => {
                                navigator.clipboard.writeText(w.iban);
                                toast({ title: "تم نسخ الآيبان" });
                              }}>نسخ الآيبان <Copy className="mr-2 h-4 w-4" /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="domains" className="animate-in fade-in duration-500">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3"><Globe className="h-6 w-6 text-primary" /> طلبات الدومين</h2>
              <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5">
                      <TableHead className="text-right p-6 font-bold">الدومين المطلوب</TableHead>
                      <TableHead className="text-right p-6 font-bold">المبلغ المدفوع</TableHead>
                      <TableHead className="text-right p-6 font-bold">حالة الطلب</TableHead>
                      <TableHead className="text-left p-6 font-bold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainRequests.map((req) => (
                      <TableRow key={req.id} className="border-white/5 h-24">
                        <TableCell className="p-6">
                          <div className="text-xl font-bold font-mono text-primary flex items-center gap-3">
                            {req.requested_domain}
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-white" onClick={() => {
                              navigator.clipboard.writeText(req.requested_domain);
                              toast({ title: "تم النسخ" });
                            }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-[10px] text-gray-500">Store ID: {req.store_id}</div>
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="font-bold text-green-500 font-mono">{Number(req.amount).toFixed(2)} ر.س</div>
                        </TableCell>
                        <TableCell className="p-6">
                          <Badge className={`${req.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'} border-none`}>
                            {req.status === 'completed' ? 'مكتمل ومفعل' : 'مدفوع - بانتظار التفعيل'}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-6 text-left">
                          {req.status !== 'completed' && (
                            <div className="flex justify-end gap-3">
                              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-6 font-bold flex items-center gap-2" onClick={() => {
                                setSelectedItem({ id: req.id, storeId: req.store_id, type: 'domain', currentDomain: req.requested_domain });
                                setFinalDomain(req.requested_domain);
                                setIsDomainMappingDialogOpen(true);
                              }}>
                                <Zap className="h-4 w-4" /> تفعيل الدومين
                              </Button>
                              <Button variant="destructive" className="rounded-xl h-10 px-6 font-bold" onClick={() => handleRejectClick(req.id, 'domain')}>رفض</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in duration-500">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3"><Settings className="h-6 w-6 text-primary" /> إعدادات المنصة</h2>
                <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-8 font-bold gap-2">
                  {savingSettings ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                  حفظ الإعدادات
                </Button>
              </div>
              
              <div className="grid gap-8">
                {/* Global Pricing Settings Section */}
                <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] p-10 space-y-10">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-green-500">
                      <Coins className="h-5 w-5" /> إعدادات التسعير العالمية (Global Pricing)
                    </h3>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-gray-400">هامش ربح الدومينات (ر.س)</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          value={platformSettings.domainProfitMargin} 
                          onChange={e => setPlatformSettings({...platformSettings, domainProfitMargin: Number(e.target.value)})}
                          className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-mono text-center pr-12" 
                        />
                        <Tag className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">هذا المبلغ يُضاف تلقائياً إلى سعر التكلفة الأساسي لكل دومين.</p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-gray-400">نسبة عمولة المنصة (%)</Label>
                      <div className="relative">
                        <Input 
                          type="number"
                          value={platformSettings.platformFee} 
                          onChange={e => setPlatformSettings({...platformSettings, platformFee: Number(e.target.value)})}
                          className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-mono text-center pr-12" 
                          max="100"
                          min="0"
                        />
                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">تُخصم من كل عملية بيع منتج تتم عبر المنصة.</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] p-10 space-y-10">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold flex items-center gap-3"><ImageIcon className="h-5 w-5 text-primary" /> الهوية والعلامة التجارية</h3>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-gray-400">اسم المنصة</Label>
                      <Input 
                        value={platformSettings.siteName} 
                        onChange={e => setPlatformSettings({...platformSettings, siteName: e.target.value})}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" 
                      />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-sm font-bold text-gray-400">شعار المنصة (URL)</Label>
                       <Input 
                        value={platformSettings.logoUrl} 
                        onChange={e => setPlatformSettings({...platformSettings, logoUrl: e.target.value})}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-mono text-xs" 
                       />
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#16191F] border-white/5 rounded-[2.5rem] p-10 space-y-6">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold flex items-center gap-3"><Bell className="h-5 w-5 text-orange-500" /> التواصل العالمي</h3>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-400">شريط الإعلانات العالمي</Label>
                    <Input 
                      value={platformSettings.announcementText} 
                      onChange={e => setPlatformSettings({...platformSettings, announcementText: e.target.value})}
                      className="h-14 bg-white/5 border-white/10 rounded-2xl" 
                      placeholder="مثال: تم تحديث أسعار الدومينات لعملاء أوج!"
                    />
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-[#16191F] border-white/10 text-white w-[95vw] max-w-md rounded-3xl p-8" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-bold">رفض الطلب</DialogTitle>
            <DialogDescription className="text-gray-400">يرجى توضيح سبب الرفض للتاجر.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Textarea 
              placeholder="سبب الرفض..." 
              className="bg-white/5 border-white/10 text-white min-h-[150px] rounded-2xl p-4" 
              value={rejectReason} 
              onChange={(e) => setRejectReason(e.target.value)} 
            />
          </div>
          <DialogFooter className="flex flex-row justify-end gap-3">
            <Button variant="destructive" className="flex-1 rounded-2xl h-14 font-bold" onClick={confirmReject} disabled={submitting}>
              تأكيد الرفض
            </Button>
            <Button variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => setIsRejectDialogOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Managed Domain Mapping Activation Dialog */}
      <Dialog open={isDomainMappingDialogOpen} onOpenChange={setIsDomainMappingDialogOpen}>
        <DialogContent className="bg-[#16191F] border-white/10 text-white w-[95vw] max-w-md rounded-3xl p-8" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" /> تفعيل الدومين المخصص
            </DialogTitle>
            <DialogDescription className="text-gray-400">أدخل الدومين الذي تم شراؤه وتوجيهه لتفعيله رسمياً على متجر التاجر.</DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-4">
            <div className="space-y-2">
               <Label className="text-sm font-bold text-gray-400">الدومين النهائي (Managed Domain)</Label>
               <Input 
                value={finalDomain} 
                onChange={(e) => setFinalDomain(e.target.value.toLowerCase())} 
                className="h-14 bg-white/5 border-white/10 text-lg font-mono text-center rounded-2xl" 
                placeholder="example.com"
               />
            </div>
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex gap-3">
               <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
               <p className="text-xs text-gray-400 leading-relaxed">بمجرد النقر على "تفعيل"، سيبدأ النظام فوراً باستقبال الزوار عبر هذا الدومين وتوجيههم لمتجر التاجر.</p>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-end gap-3">
            <Button className="flex-1 bg-primary hover:bg-primary/90 rounded-2xl h-14 font-bold text-lg" onClick={handleActivateDomain} disabled={submitting || !finalDomain}>
              {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : "تفعيل الآن"}
            </Button>
            <Button variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => setIsDomainMappingDialogOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

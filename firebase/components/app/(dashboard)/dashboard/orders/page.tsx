
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { getRecentOrders, getStoreByOwner, updateOrderStatus } from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Package, 
  Calendar, 
  DollarSign, 
  Loader2, 
  ArrowLeftRight, 
  Search, 
  ChevronLeft, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ExternalLink,
  MoreVertical,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function OrdersPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (!user || !db) return;
      try {
        const storeData = await getStoreByOwner(db, user.uid);
        if (storeData) {
          setStore(storeData);
          const data = await getRecentOrders(db, storeData.id);
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user, db]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'paid' || o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalAmount: orders.reduce((acc, o) => acc + (o.total || 0), 0)
    };
  }, [orders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!store || !db) return;
    setUpdating(true);
    try {
      await updateOrderStatus(db, store.id, orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast({ title: "تم التحديث", description: "تم تغيير حالة الطلب بنجاح." });
    } catch (err) {
      toast({ title: "خطأ", description: "فشل تحديث حالة الطلب.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-10 text-right animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-500">تابع مبيعاتك، تتبع الشحنات، وقم بتحديث حالات الطلب لعملائك.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="ابحث برقم الطلب أو اسم العميل..." 
            className="h-12 pr-12 bg-white border-gray-100 rounded-2xl shadow-sm focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
          <CardContent className="p-8 space-y-4">
             <div className="p-3 bg-primary/5 text-primary w-fit rounded-xl"><ShoppingCart className="h-6 w-6" /></div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">إجمالي الطلبات</p>
               <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
          <CardContent className="p-8 space-y-4">
             <div className="p-3 bg-orange-50 text-orange-600 w-fit rounded-xl"><Clock className="h-6 w-6" /></div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">قيد التنفيذ</p>
               <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
          <CardContent className="p-8 space-y-4">
             <div className="p-3 bg-green-50 text-green-600 w-fit rounded-xl"><CheckCircle2 className="h-6 w-6" /></div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">مكتمل</p>
               <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
             </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden rounded-[2rem]">
          <CardContent className="p-8 space-y-4">
             <div className="p-3 bg-white/20 text-white w-fit rounded-xl"><DollarSign className="h-6 w-6" /></div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">إجمالي المبيعات</p>
               <p className="text-3xl font-bold font-mono">{stats.totalAmount.toLocaleString('ar-SA')} ر.س</p>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100 h-16">
                <TableHead className="text-right p-6 font-bold text-gray-900">الطلب</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">العميل</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">التاريخ</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">المبلغ</TableHead>
                <TableHead className="text-right p-6 font-bold text-gray-900">الحالة</TableHead>
                <TableHead className="text-left p-6 font-bold text-gray-900"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32 text-gray-400 italic">لا توجد طلبات تطابق بحثك حالياً.</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="hover:bg-primary/[0.01] border-gray-50 h-20 transition-colors cursor-pointer group"
                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                  >
                    <TableCell className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] text-gray-400 uppercase">{order.items?.[0]?.type === 'physical' ? 'شحن مادي' : 'تسليم رقمي'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                          {order.customer_name?.[0] || 'ع'}
                        </div>
                        <span className="font-bold text-gray-700">{order.customer_name || 'عميل أوج'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-6 text-gray-500 font-mono">
                      {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString('ar-EG') : 'الآن'}
                    </TableCell>
                    <TableCell className="p-6 font-bold font-mono text-primary text-lg">
                      {order.total?.toLocaleString('ar-SA')} ر.س
                    </TableCell>
                    <TableCell className="p-6">
                      <Badge className={`px-4 py-1.5 rounded-lg border-none text-[10px] font-bold ${
                        order.status === 'completed' ? 'bg-green-50 text-green-600' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {order.status === 'completed' ? 'مكتمل' : 
                         order.status === 'shipped' ? 'تم الشحن' : 
                         order.status === 'paid' ? 'بانتظار التنفيذ' : 'قيد المعالجة'}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-6 text-left">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-[2.5rem] p-10 text-right overflow-y-auto max-h-[90vh]" dir="rtl">
          <DialogHeader className="border-b border-gray-50 pb-6">
            <div className="flex items-center justify-between mb-2">
               <DialogTitle className="text-2xl font-bold">تفاصيل الطلب #{selectedOrder?.id.slice(-6).toUpperCase()}</DialogTitle>
               <Badge className={`px-4 py-1.5 rounded-lg border-none font-bold ${
                  selectedOrder?.status === 'completed' ? 'bg-green-50 text-green-600' :
                  selectedOrder?.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  {selectedOrder?.status === 'completed' ? 'مكتمل' : 
                   selectedOrder?.status === 'shipped' ? 'تم الشحن' : 'قيد التنفيذ'}
               </Badge>
            </div>
            <DialogDescription className="text-sm">
              تاريخ الطلب: {selectedOrder?.createdAt?.toDate ? new Date(selectedOrder.createdAt.toDate()).toLocaleString('ar-EG') : 'غير متوفر'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 space-y-10">
            {/* Customer Section */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2">
                  <User className="h-4 w-4" /> بيانات العميل
                </h4>
                <div className="p-6 bg-gray-50 rounded-2xl space-y-3">
                  <p className="font-bold text-gray-900">{selectedOrder?.customer_name || 'الاسم غير متوفر'}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2 font-mono" dir="ltr">
                    <Phone className="h-3 w-3" /> {selectedOrder?.customer_phone || 'لا يوجد رقم'}
                  </p>
                </div>
              </div>

              {/* Shipping Section (Only if physical) */}
              {selectedOrder?.items?.some((i: any) => i.type === 'physical') && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> عنوان الشحن
                  </h4>
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                    <p className="font-bold text-primary">{selectedOrder?.shipping_info?.city || 'الرياض'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder?.shipping_info?.address || 'لم يتم تحديد العنوان بالتفصيل'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2">
                <Package className="h-4 w-4" /> المنتجات المشتراة
              </h4>
              <div className="divide-y divide-gray-100 bg-white border border-gray-100 rounded-3xl overflow-hidden">
                {selectedOrder?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        {item.type === 'physical' ? <Truck className="h-6 w-6" /> : <ExternalLink className="h-6 w-6" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{item.title}</span>
                        <span className="text-xs text-gray-400">الكمية: {item.quantity || 1}</span>
                      </div>
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-primary font-mono">{Number(item.price).toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-8 bg-gray-900 text-white rounded-[2rem] flex items-center justify-between shadow-xl shadow-gray-200">
               <div className="space-y-1">
                 <p className="text-xs font-bold opacity-50 uppercase tracking-widest">المجموع الإجمالي</p>
                 <p className="text-4xl font-bold font-mono">{selectedOrder?.total?.toLocaleString('ar-SA')} ر.س</p>
               </div>
               <div className="h-12 w-px bg-white/20"></div>
               <div className="space-y-1 text-left">
                 <p className="text-xs font-bold opacity-50 uppercase tracking-widest">طريقة الدفع</p>
                 <p className="font-bold flex items-center gap-2 justify-end">بطاقة مدى <Check className="h-4 w-4 text-green-400" /></p>
               </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  disabled={updating}
                  className="flex-1 h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 gap-3"
                >
                  {updating ? <Loader2 className="animate-spin h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
                  تغيير حالة الطلب
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 bg-white rounded-2xl shadow-2xl border-gray-100">
                <DropdownMenuItem 
                  className="p-4 rounded-xl cursor-pointer hover:bg-orange-50 text-orange-600 font-bold gap-3"
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'paid')}
                >
                  <Clock className="h-4 w-4" /> قيد التنفيذ
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="p-4 rounded-xl cursor-pointer hover:bg-blue-50 text-blue-600 font-bold gap-3"
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                >
                  <Truck className="h-4 w-4" /> تم الشحن
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="p-4 rounded-xl cursor-pointer hover:bg-green-50 text-green-600 font-bold gap-3"
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                >
                  <CheckCircle2 className="h-4 w-4" /> مكتمل
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              className="flex-1 h-14 font-bold text-gray-400 hover:text-gray-900" 
              onClick={() => setIsModalOpen(false)}
            >
              إغلاق المعاينة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser, useFirebaseApp } from '@/firebase';
import { getStoreByOwner, updateStoreSettings, uploadVerificationDoc } from '@/lib/firestore-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, UploadCloud, Loader2, CheckCircle2, AlertCircle, FileText, UserCheck, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function VerificationPage() {
  const { user } = useUser();
  const db = useFirestore();
  const app = useFirebaseApp();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullNameAr: '',
    fullNameEn: '',
    docType: 'freelance',
    docNumber: ''
  });
  
  const [files, setFiles] = useState<{ id: File | null; doc: File | null }>({ id: null, doc: null });

  useEffect(() => {
    async function loadStore() {
      if (!user || !db) return;
      const data = await getStoreByOwner(db, user.uid);
      if (data) {
        setStore(data);
        if (data.verification_details) {
          setFormData({
            fullNameAr: data.verification_details.fullNameAr || '',
            fullNameEn: data.verification_details.fullNameEn || '',
            docType: data.verification_details.docType || 'freelance',
            docNumber: data.verification_details.docNumber || ''
          });
        }
      }
      setLoading(false);
    }
    loadStore();
  }, [user, db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !db || !app) return;
    
    // Validate files if first time
    if (store.verification_status === 'none' && (!files.id || !files.doc)) {
      toast({ title: "بيانات ناقصة", description: "يرجى رفع صورة الهوية ووثيقة العمل الحر.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let idUrl = store.verification_details?.idUrl || '';
      let docUrl = store.verification_details?.docUrl || '';

      if (files.id) idUrl = await uploadVerificationDoc(app, files.id, store.id, 'id');
      if (files.doc) docUrl = await uploadVerificationDoc(app, files.doc, store.id, 'doc');

      await updateStoreSettings(db, store.id, {
        verification_status: 'pending',
        verification_details: {
          ...formData,
          idUrl,
          docUrl,
          submittedAt: new Date().toISOString()
        }
      });

      toast({ title: "تم إرسال الطلب", description: "جاري مراجعة بياناتك من قبل فريقنا." });
      setStore({ ...store, verification_status: 'pending' });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل إرسال البيانات.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  const statusMap = {
    none: { label: 'غير موثق', color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
    pending: { label: 'قيد المراجعة', color: 'bg-orange-50 text-orange-600', icon: Clock },
    verified: { label: 'موثق', color: 'bg-green-50 text-green-600', icon: CheckCircle2 },
    rejected: { label: 'مرفوض', color: 'bg-red-50 text-red-600', icon: AlertCircle }
  };

  const currentStatus = statusMap[store.verification_status as keyof typeof statusMap] || statusMap.none;

  return (
    <div className="space-y-10 text-right max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-bold text-gray-900">توثيق الحساب</h1>
          <p className="text-gray-500">لضمان أمان مدفوعاتك، يجب توثيق هوية المتجر رسمياً.</p>
        </div>
        <Badge className={`h-10 px-6 rounded-full text-sm font-bold flex items-center gap-2 ${currentStatus.color}`}>
          <currentStatus.icon className="h-4 w-4" /> {currentStatus.label}
        </Badge>
      </div>

      <div className="grid gap-8">
        <Card className="border-gray-100 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                 <ShieldCheck className="h-6 w-6" />
               </div>
               <div>
                 <CardTitle className="text-xl font-bold">المعلومات الشخصية والقانونية</CardTitle>
                 <CardDescription>يرجى إدخال البيانات كما تظهر في الأوراق الرسمية تماماً.</CardDescription>
               </div>
             </div>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
               <div className="grid gap-8 md:grid-cols-2">
                 <div className="space-y-3">
                    <Label className="text-sm font-bold">الاسم الكامل بالعربي</Label>
                    <Input 
                      placeholder="مثال: محمد أحمد علي" 
                      value={formData.fullNameAr} 
                      onChange={e => setFormData({...formData, fullNameAr: e.target.value})}
                      className="h-14 bg-gray-50/50 rounded-2xl"
                      disabled={store.verification_status === 'verified' || store.verification_status === 'pending'}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-sm font-bold">الاسم الكامل بالإنجليزي</Label>
                    <Input 
                      placeholder="Example: Mohammed Ahmed Ali" 
                      value={formData.fullNameEn} 
                      onChange={e => setFormData({...formData, fullNameEn: e.target.value})}
                      className="h-14 bg-gray-50/50 rounded-2xl"
                      disabled={store.verification_status === 'verified' || store.verification_status === 'pending'}
                    />
                 </div>
               </div>

               <div className="grid gap-8 md:grid-cols-2">
                 <div className="space-y-3">
                    <Label className="text-sm font-bold">نوع الوثيقة</Label>
                    <Select 
                      value={formData.docType} 
                      onValueChange={(val) => setFormData({...formData, docType: val})}
                      disabled={store.verification_status === 'verified' || store.verification_status === 'pending'}
                    >
                      <SelectTrigger className="h-14 bg-gray-50/50 rounded-2xl">
                        <SelectValue placeholder="اختر نوع الوثيقة" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="freelance">وثيقة عمل حر</SelectItem>
                        <SelectItem value="commercial">سجل تجاري</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-sm font-bold">رقم الوثيقة</Label>
                    <Input 
                      placeholder="123456789" 
                      value={formData.docNumber} 
                      onChange={e => setFormData({...formData, docNumber: e.target.value})}
                      className="h-14 bg-gray-50/50 rounded-2xl"
                      disabled={store.verification_status === 'verified' || store.verification_status === 'pending'}
                    />
                 </div>
               </div>

               <div className="grid gap-8 md:grid-cols-2 pt-6">
                 <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2"><UserCheck className="h-4 w-4" /> صورة الهوية الوطنية</Label>
                    <div className="relative group">
                      <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-3 transition-all ${files.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:border-primary/20'}`}>
                        <UploadCloud className={`h-8 w-8 ${files.id ? 'text-primary' : 'text-gray-300'}`} />
                        <span className="text-xs font-bold text-gray-500">{files.id?.name || 'انقر لرفع الهوية'}</span>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer disabled:hidden" 
                          onChange={(e) => setFiles({ ...files, id: e.target.files?.[0] || null })}
                          disabled={store.verification_status === 'verified' || store.verification_status === 'pending'}
                        />
                      </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2"><FileText className="h-4 w-4" /> صورة وثيقة العمل الحر / السجل</Label>
                    <div className="relative group">
                      <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-3 transition-all ${files.doc ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:border-primary/20'}`}>
                        <UploadCloud className={`h-8 w-8 ${files.doc ? 'text-primary' : 'text-gray-300'}`} />
                        <span className="text-xs font-bold text-gray-500">{files.doc?.name || 'انقر لرفع الوثيقة'}</span>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer disabled:hidden" 
                          onChange={(e) => setFiles({ ...files, doc: e.target.files?.[0] || null })}
                          disabled={store.verification_status === 'verified' || store.verification_status === 'pending'}
                        />
                      </div>
                    </div>
                 </div>
               </div>

               {store.verification_status !== 'verified' && store.verification_status !== 'pending' && (
                 <div className="flex justify-center pt-10">
                    <Button type="submit" disabled={saving} className="h-16 px-16 bg-primary text-lg font-bold rounded-2xl shadow-xl shadow-primary/20">
                      {saving ? <Loader2 className="animate-spin ml-2" /> : <ShieldCheck className="ml-2" />}
                      إرسال طلب التوثيق
                    </Button>
                 </div>
               )}

               {store.verification_status === 'pending' && (
                 <div className="p-8 bg-orange-50 border border-orange-100 rounded-3xl flex items-center gap-4 text-orange-700">
                    <Clock className="h-6 w-6" />
                    <p className="font-bold">طلبك قيد المراجعة حالياً. يستغرق فريقنا عادة من 24-48 ساعة عمل للتحقق من البيانات.</p>
                 </div>
               )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

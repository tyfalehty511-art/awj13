
"use client";

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Feather, Chrome, Loader2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const ADMIN_EMAIL = 'faleh18511@gmail.com';

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && !userLoading) {
      const timer = setTimeout(() => {
        if (user.email === ADMIN_EMAIL) {
          router.push('/admin-dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, userLoading, router]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً في أوج." });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      let message = "فشل الاتصال بـ Google أو تم إلغاء العملية.";
      if (error.code === 'auth/popup-blocked') {
        message = "يرجى السماح بالنوافذ المنبثقة (Popups) في متصفحك.";
      }
      setErrorMessage(message);
      toast({ title: "خطأ", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "تم إنشاء الحساب", description: "مرحباً بك في أوج!" });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "مرحباً بك", description: "تم تسجيل الدخول بنجاح." });
      }
    } catch (error: any) {
      console.error("Auth Error Code:", error.code);
      let message = "حدث خطأ غير متوقع.";
      
      switch (error.code) {
        case 'auth/network-request-failed':
          message = "خطأ في الشبكة: يرجى التأكد من اتصالك بالإنترنت.";
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
          break;
        case 'auth/email-already-in-use':
          message = "هذا البريد الإلكتروني مسجل بالفعل، جرب تسجيل الدخول.";
          break;
        case 'auth/weak-password':
          message = "كلمة المرور ضعيفة جداً (6 أحرف على الأقل).";
          break;
        case 'auth/invalid-email':
          message = "صيغة البريد الإلكتروني غير صحيحة.";
          break;
        case 'auth/operation-not-allowed':
          message = "تسجيل الدخول بالبريد معطل حالياً، يرجى مراجعة الإدارة.";
          break;
        default:
          message = `خطأ: ${error.message || "لا يمكن إتمام العملية حالياً"}`;
      }
      
      setErrorMessage(message);
      toast({ title: "خطأ في الدخول", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4 font-body overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(97,104,240,0.05),transparent)] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <Card className="bg-white border-gray-100 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-4 text-center pb-4 pt-10">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 transform hover:scale-105 transition-transform duration-300">
                <Feather className="text-white h-9 w-9" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-headline font-bold text-gray-900 tracking-tight">
                {user ? "مرحباً بك، أوج" : (isSignUp ? "إنشاء حساب جديد" : "مرحباً بك في أوج")}
              </CardTitle>
              <CardDescription className="text-gray-500 text-lg">
                {user ? "...جاري نقلك إلى لوحة التحكم" : (isSignUp ? "ابدأ رحلتك كمنشئ محتوى وناشر أدبي" : "لوحة تحكم المبدعين والناشرين")}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 pb-12 pt-4 text-center">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in shake-in">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {user ? (
              <div className="flex flex-col items-center gap-8 py-6">
                <div className="relative flex items-center justify-center">
                   <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                   <ShieldCheck className="h-8 w-8 text-primary absolute" />
                </div>
                
                <div className="w-full px-6">
                  <Link href={user.email === ADMIN_EMAIL ? "/admin-dashboard" : "/dashboard"}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 rounded-2xl text-lg shadow-lg shadow-primary/20 group">
                      {user.email === ADMIN_EMAIL ? "دخول لوحة الإدارة" : "دخول لوحة التحكم"} 
                      <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-[-4px] transition-transform" />
                    </Button>
                  </Link>
                  <p className="mt-4 text-xs text-gray-400 font-medium">إذا لم يتم تحويلك تلقائياً، انقر على الزر أعلاه</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <Input 
                    type="email" 
                    placeholder="البريد الإلكتروني" 
                    required 
                    className="bg-gray-50 border-gray-100 h-14 rounded-2xl text-right text-lg"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <Input 
                    type="password" 
                    placeholder="كلمة المرور" 
                    required 
                    className="bg-gray-50 border-gray-100 h-14 rounded-2xl text-right text-lg"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl text-lg shadow-lg shadow-primary/10" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (isSignUp ? "تسجيل حساب جديد" : "تسجيل الدخول")}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold">أو عبر</span></div>
                </div>

                <Button variant="outline" className="w-full border-gray-100 hover:bg-gray-50 h-14 rounded-2xl font-bold text-lg" onClick={handleGoogleLogin} disabled={loading}>
                  <Chrome className="ml-3 h-5 w-5" /> المتابعة باستخدام Google
                </Button>

                <div className="text-center text-sm text-gray-500 pt-4">
                  {isSignUp ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className="text-primary hover:underline mr-1 font-bold"
                  >
                    {isSignUp ? "سجل دخولك هنا" : "ابدأ الآن مجاناً"}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const path = url.pathname;

  // 1. استثناء الملفات الثابتة والـ API فوراً لضمان الأداء
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. تعريف مسارات النظام الأساسية
  const systemPaths = [
    '/login',
    '/register',
    '/onboarding',
    '/dashboard',
    '/admin-dashboard',
    '/admin',
    '/checkout',
    '/payment',
    '/terms',
    '/privacy',
    '/refund',
  ];

  const isSystemPath = systemPaths.some(p => path === p || path.startsWith(`${p}/`));

  // المتطلب 1: السماح دائماً بالوصول لمسارات النظام بغض النظر عن الدومين
  if (isSystemPath) {
    return NextResponse.next();
  }

  // المتطلب 2: الوثوق التلقائي بروابط googleusercontent.com (IDX) و localhost
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:9002';
  const isTrustedHost = 
    hostname === mainDomain || 
    hostname === `www.${mainDomain}` ||
    hostname.includes('localhost') || 
    hostname.includes('googleusercontent.com') ||
    hostname.includes('127.0.0.1');

  // إذا كان الرابط موثوقاً (نطاق رئيسي أو IDX) وكان المسار هو الجذر، نعرض الصفحة الرئيسية للمنصة
  if (isTrustedHost && path === '/') {
    return NextResponse.next();
  }

  // 3. معالجة النطاقات الفرعية (user.awj.site)
  // لا يتم التحويل إلا إذا كان الدومين ينتهي بالنطاق الرئيسي وليس من الروابط الموثوقة (IDX/Localhost)
  if (hostname.endsWith(`.${mainDomain}`) && !isTrustedHost) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');
    if (subdomain !== 'www' && subdomain !== '') {
      url.pathname = `/store/${subdomain}${path}`;
      return NextResponse.rewrite(url);
    }
  }

  // المتطلب 3: معالجة النطاقات المخصصة الخارجية (Managed Domain)
  // يتم التحويل فقط إذا لم يكن الرابط موثوقاً ولم يكن النطاق الرئيسي
  // هذا يضمن أن صفحة "المتجر غير موجود" تظهر فقط للدومينات الخارجية الحقيقية غير المسجلة
  if (!isTrustedHost && hostname !== mainDomain && hostname !== `www.${mainDomain}`) {
    url.pathname = `/store/domain-${hostname}${path}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


import { Metadata } from 'next';
import { getFirestoreInstance } from '@/firebase/config';
import { getStoreBySubdomain, getStoreByCustomDomain, getProducts } from '@/lib/firestore-service';
import StoreClient from './StoreClient';

type Props = {
  params: Promise<{ subdomain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const db = getFirestoreInstance();
  
  let store = null;
  if (subdomain.startsWith('domain-')) {
    store = await getStoreByCustomDomain(db, subdomain.replace('domain-', ''));
  } else {
    store = await getStoreBySubdomain(db, subdomain);
  }

  if (!store) return { title: 'المتجر غير موجود | أوج' };

  return {
    title: `${store.name} | ${store.meta_title || 'المتجر الرسمي'}`,
    description: store.meta_description || 'تسوق أفضل المنتجات الرقمية والكتب والخدمات من متجرنا.',
    openGraph: {
      title: store.name,
      description: store.meta_description,
      images: store.logo_url ? [{ url: store.logo_url }] : [],
    },
    alternates: {
      canonical: store.custom_domain ? `https://${store.custom_domain}` : `https://${store.subdomain}.awj.site`,
    }
  };
}

export default async function StorefrontPage({ params }: Props) {
  const { subdomain } = await params;
  const db = getFirestoreInstance();
  
  let storeData = null;
  if (subdomain.startsWith('domain-')) {
    storeData = await getStoreByCustomDomain(db, subdomain.replace('domain-', ''));
  } else {
    storeData = await getStoreBySubdomain(db, subdomain);
  }

  if (!storeData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50" dir="rtl">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
           <span className="text-4xl font-bold text-primary">أ</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">عذراً، هذا المتجر غير موجود</h2>
        <p className="text-gray-500 max-w-md">الرابط الذي تحاول الوصول إليه ربما تم حذفه أو تغييره. تأكد من كتابة الرابط بشكل صحيح.</p>
        <a href="/" className="mt-8 text-primary font-bold hover:underline">العودة لمنصة أوج</a>
      </div>
    );
  }

  const productsData = await getProducts(db, storeData.id);

  // JSON-LD for Store
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: storeData.name,
    description: storeData.meta_description,
    url: storeData.custom_domain ? `https://${storeData.custom_domain}` : `https://${storeData.subdomain}.awj.site`,
    logo: storeData.logo_url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoreClient store={storeData} initialProducts={productsData} subdomain={subdomain} />
    </>
  );
}

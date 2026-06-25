import { Metadata } from 'next';
import { getFirestoreInstance } from '@/firebase/config';
import { getStoreBySubdomain, getStoreByCustomDomain, getProductById } from '@/lib/firestore-service';
import ProductClient from './ProductClient';

type Props = {
  params: Promise<{ subdomain: string; productId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, productId } = await params;
  const db = getFirestoreInstance();
  
  let store = null;
  if (subdomain.startsWith('domain-')) {
    store = await getStoreByCustomDomain(db, subdomain.replace('domain-', ''));
  } else {
    store = await getStoreBySubdomain(db, subdomain);
  }

  if (!store) return { title: 'المنتج غير موجود' };
  
  const product = await getProductById(db, store.id, productId);
  if (!product) return { title: `منتج في ${store.name}` };

  return {
    title: `${product.title} | ${store.name}`,
    description: product.description?.slice(0, 160) || `اشترِ ${product.title} من متجر ${store.name} الآن بأفضل سعر.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
      type: 'website',
    },
    alternates: {
      canonical: store.custom_domain ? `https://${store.custom_domain}/product/${productId}` : `https://${store.subdomain}.awj.site/product/${productId}`,
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { subdomain, productId } = await params;
  const db = getFirestoreInstance();
  
  let storeData = null;
  if (subdomain.startsWith('domain-')) {
    storeData = await getStoreByCustomDomain(db, subdomain.replace('domain-', ''));
  } else {
    storeData = await getStoreBySubdomain(db, subdomain);
  }

  if (!storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-gray-50" dir="rtl">
        <h2 className="text-3xl font-bold">المتجر غير موجود</h2>
      </div>
    );
  }

  const productData = await getProductById(db, storeData.id, productId);

  if (!productData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50" dir="rtl">
        <h2 className="text-3xl font-bold mb-2">عذراً، المنتج غير موجود</h2>
        <p className="text-gray-500">ربما تم حذف هذا المنتج أو لم يعد متاحاً للبيع.</p>
        <a href="/" className="mt-6 text-primary font-bold hover:underline">العودة للمتجر</a>
      </div>
    );
  }

  // JSON-LD for Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productData.title,
    image: productData.image_url,
    description: productData.description,
    sku: productData.sku || productData.id,
    offers: {
      '@type': 'Offer',
      price: productData.price,
      priceCurrency: 'SAR',
      availability: productData.stock > 0 || productData.type !== 'physical' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: storeData.custom_domain ? `https://${storeData.custom_domain}/product/${productId}` : `https://${subdomain}.awj.site/product/${productId}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient store={storeData} product={productData} subdomain={subdomain} />
    </>
  );
}

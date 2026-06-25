
import { MetadataRoute } from 'next';
import { getFirestoreInstance } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getFirestoreInstance();
  const mainDomain = 'https://awj.site';
  
  // Static pages
  const routes = [
    '',
    '/login',
    '/onboarding',
  ].map((route) => ({
    url: `${mainDomain}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as any,
    priority: 1.0,
  }));

  try {
    // Fetch all stores
    const storesSnap = await getDocs(collection(db, 'stores'));
    const storeUrls: any[] = [];
    const productUrls: any[] = [];

    for (const storeDoc of storesSnap.docs) {
      const store = storeDoc.data();
      const storeBaseUrl = store.custom_domain 
        ? `https://${store.custom_domain}` 
        : `https://${store.subdomain}.awj.site`;

      storeUrls.push({
        url: storeBaseUrl,
        lastModified: store.updatedAt?.toDate() || new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });

      // Fetch products for this store
      const productsSnap = await getDocs(collection(db, 'stores', storeDoc.id, 'products'));
      productsSnap.forEach((productDoc) => {
        const product = productDoc.data();
        productUrls.push({
          url: `${storeBaseUrl}/product/${productDoc.id}`,
          lastModified: product.updatedAt?.toDate() || new Date(),
          changeFrequency: 'daily',
          priority: 0.6,
        });
      });
    }

    return [...routes, ...storeUrls, ...productUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}

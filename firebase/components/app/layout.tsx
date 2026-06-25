
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AnnouncementBar } from '@/components/AnnouncementBar';

export const metadata: Metadata = {
  title: 'أوج - منصة المبدعين والناشرين',
  description: 'أنشئ متجرك لبيع الكتب والمنتجات الرقمية في ثوانٍ مع أوج.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <AnnouncementBar />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

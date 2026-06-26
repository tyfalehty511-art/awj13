
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { getPlatformSettings } from '@/lib/firestore-service';
import { Megaphone, X } from 'lucide-react';

export function AnnouncementBar() {
  const db = useFirestore();
  const [settings, setSettings] = useState<any>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!db) return;
      const data = await getPlatformSettings(db);
      if (data && data.announcementActive) {
        setSettings(data);
      }
    }
    fetchSettings();
  }, [db]);

  if (!settings || !visible) return null;

  return (
    <div className="bg-primary text-white py-3 px-6 text-center relative z-[100] animate-in slide-in-from-top duration-500">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Megaphone className="h-4 w-4 animate-bounce" />
        <p className="text-sm font-bold tracking-wide">{settings.announcementText}</p>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="absolute left-4 top-1/2 -translate-y-1/2 hover:bg-white/10 p-1 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

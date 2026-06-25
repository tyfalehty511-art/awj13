
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview استماع مركزي لأخطاء صلاحيات Firestore وعرضها للمستخدم.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.context);
      
      toast({
        variant: "destructive",
        title: "خطأ في الصلاحيات",
        description: `ليس لديك تصريح لإجراء عملية (${error.context.operation}) على المسار: ${error.context.path}. يرجى مراجعة الإدارة.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}

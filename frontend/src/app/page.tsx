'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import AuthProvider from '@/components/providers/AuthProvider';
import Dashboard from '@/components/Dashboard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const { isAuthenticated, isLoading, checkAuth } = useStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
} 
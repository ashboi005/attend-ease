'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  role: UserRole;
}

const rolePaths: { [key in UserRole]: string } = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};

export default function RoleGuard({ children, role }: RoleGuardProps) {
  const { userProfile, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth state to be determined

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (userProfile?.role !== role) {
      // Redirect to the user's correct dashboard or login if role is somehow missing
      const redirectPath = userProfile?.role ? rolePaths[userProfile.role] : '/login';
      router.push(redirectPath);
    }
  }, [userProfile, loading, isAuthenticated, role, router]);

  // Render a loading state while checking auth
  if (loading || !isAuthenticated || userProfile?.role !== role) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading & Verifying Access...</p>
      </div>
    );
  }

  // If authorized, render the children components
  return <>{children}</>;
}

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserRole, UserProfile } from '@/lib/user';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const role = await getUserRole(user.uid);
        if (role) {
          const profile: UserProfile = { uid: user.uid, email: user.email!, role, displayName: user.displayName || '' };
          setUserProfile(profile);
        } else {
          // Handle case where user exists in Auth but not in Firestore
          auth.signOut();
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    const isRootPage = pathname === '/';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && (isAuthPage || isRootPage)) {
        if(userProfile){
            router.push(`/${userProfile.role}`);
        }
    }
  }, [user, userProfile, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
      {loading ? <div className="flex min-h-screen items-center justify-center">Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

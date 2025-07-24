import Sidebar from '@/components/admin/Sidebar';
import RoleGuard from '@/components/auth/RoleGuard';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="admin">
      <div className="flex h-screen" style={{backgroundColor: '#F0E7D5'}}>
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto" style={{color: '#212842'}}>
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}

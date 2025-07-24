import Sidebar from '@/components/student/Sidebar';
import RoleGuard from '@/components/auth/RoleGuard';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="student">
      <div className="flex h-screen" style={{backgroundColor: '#F0E7D5'}}>
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto" style={{color: '#212842'}}>
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}

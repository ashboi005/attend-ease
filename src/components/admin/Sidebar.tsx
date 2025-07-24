'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const navLinks = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Manage Classes', href: '/admin/classes' },
  { name: 'Manage Teachers', href: '/admin/teachers' },
  { name: 'Manage Students', href: '/admin/students' },
  { name: 'Timetables', href: '/admin/timetables' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 text-white flex flex-col" style={{backgroundColor: '#212842'}}>
      <div className="p-4 border-b" style={{borderColor: '#2D3548'}}>
        <h2 className="text-xl font-bold" style={{color: '#F0E7D5', fontFamily: 'var(--font-crimson), serif', fontWeight: 700}}>Admin Panel</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'text-white' 
                  : 'hover:text-white'
              }`}
              style={{
                backgroundColor: isActive ? '#2D3548' : 'transparent',
                color: isActive ? '#F0E7D5' : '#E8DCC6'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#2D3548';
                  e.currentTarget.style.color = '#F0E7D5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#E8DCC6';
                }
              }}>
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t" style={{borderColor: '#2D3548'}}>
        <button 
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 rounded-md transition-colors"
          style={{color: '#E8DCC6'}}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.color = '#F0E7D5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#E8DCC6';
          }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

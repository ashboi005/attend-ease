'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { name: 'Dashboard', href: '/student' },
  { name: 'My Timetable', href: '/student/timetable' },
  { name: 'My Attendance', href: '/student/attendance' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-64 text-white flex flex-col" style={{backgroundColor: '#212842'}}>
      <div className="p-6 text-2xl font-bold border-b" style={{borderColor: '#2D3548', color: '#F0E7D5', fontFamily: 'var(--font-crimson), serif', fontWeight: 700}}>
        <Link href="/student">Student Panel</Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="block py-2.5 px-4 rounded transition duration-200"
              style={{
                backgroundColor: isActive ? '#2D3548' : 'transparent',
                color: isActive ? '#F0E7D5' : '#E8DCC6'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLAnchorElement).style.backgroundColor = '#2D3548';
                  (e.target as HTMLAnchorElement).style.color = '#F0E7D5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLAnchorElement).style.color = '#E8DCC6';
                }
              }}>
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t" style={{borderColor: '#2D3548'}}>
        <button 
          onClick={logout}
          className="w-full py-2.5 px-4 rounded transition duration-200 text-left"
          style={{color: '#E8DCC6'}}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
            (e.target as HTMLButtonElement).style.color = '#F0E7D5';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.target as HTMLButtonElement).style.color = '#E8DCC6';
          }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

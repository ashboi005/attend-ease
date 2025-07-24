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
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        <Link href="/student">Student Panel</Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block py-2.5 px-4 rounded transition duration-200 ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}>
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={logout}
          className="w-full py-2.5 px-4 rounded transition duration-200 bg-red-600 hover:bg-red-700 text-left">
          Sign Out
        </button>
      </div>
    </div>
  );
}

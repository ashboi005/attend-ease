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
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-4 py-2 rounded-md ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 rounded-md hover:bg-red-500">
          Sign Out
        </button>
      </div>
    </aside>
  );
}

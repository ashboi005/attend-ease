'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome, {userProfile?.displayName || 'Student'}!
      </h1>
      <p className="text-gray-600">
        This is your personal dashboard. Here you can view your attendance and check your timetable.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Attendance Card */}
        <Link href="/student/attendance" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer block">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">My Attendance</h2>
            <p className="text-gray-500">View your attendance records for all classes.</p>
        </Link>

        {/* My Timetable Card */}
        <Link href="/student/timetable" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer block">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">My Timetable</h2>
            <p className="text-gray-500">Check your weekly class schedule.</p>
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800">Teacher&apos;s Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome, {user?.displayName || 'Teacher'}!</h2>
          <p className="text-gray-600 mt-2">This is your central hub for managing your classes, schedules, and student attendance. Use the sidebar to navigate through the different sections.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg text-gray-700">Today&apos;s Classes</h3>
            <p className="text-gray-600 mt-2">You have 3 classes scheduled for today.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg text-gray-700">Pending Attendance</h3>
            <p className="text-gray-600 mt-2">1 class requires attendance marking.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg text-gray-700">Quick Links</h3>
            <ul className="list-disc list-inside mt-2 text-indigo-600">
              <li><a href="/teacher/timetable" className="hover:underline">View Full Timetable</a></li>
              <li><a href="/teacher/attendance" className="hover:underline">Take Attendance Now</a></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

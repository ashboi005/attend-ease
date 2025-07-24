'use client';

import { useAuth } from '@/context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome, {user?.displayName || 'Teacher'}!</h2>
          <p className="text-gray-600 mt-2">This is your central hub for managing your classes, schedules, and student attendance. Use the sidebar to navigate through the different sections.</p>
        </div>
      </div>
    </main>
  );
}

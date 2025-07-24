'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Class } from '@/types';

export default function StudentDashboardPage() {
    const { userProfile } = useAuth();
  const [assignedClass, setAssignedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchAssignedClass = async () => {
      if (userProfile?.uid) {
        try {
          const q = query(collection(db, 'classes'), where('studentIds', 'array-contains', userProfile.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const classDoc = querySnapshot.docs[0];
            setAssignedClass({ ...classDoc.data(), id: classDoc.id } as Class);
          }
        } catch (error) {
          console.error("Error fetching student's class: ", error);
        }
      }
      setLoading(false);
    };

    fetchAssignedClass();
  }, [userProfile]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome, {userProfile?.displayName || 'Student'}!
      </h1>
            <p className="text-gray-600">
        This is your personal dashboard. Here you can view your attendance and check your timetable.
      </p>

      {loading ? (
        <p>Loading your class information...</p>
      ) : assignedClass ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">My Class</h2>
          <p className="text-gray-600">
            You are enrolled in: <span className="font-bold">{assignedClass.name} ({assignedClass.code})</span>
          </p>
        </div>
      ) : (
        <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2 text-yellow-800">No Class Assigned</h2>
            <p className="text-yellow-600">
                You are not currently assigned to any class. Please contact your administrator.
            </p>
        </div>
      )}

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

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Timetable, Class } from '@/types';

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [classes, setClasses] = useState<Map<string, Class>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTimetable = async () => {
      setLoading(true);
      const q = query(collection(db, 'timetables'), where('teacherId', '==', user.uid));
      const timetableSnapshot = await getDocs(q);
      const teacherTimetable = timetableSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Timetable));
      setTimetable(teacherTimetable);

      if (teacherTimetable.length > 0) {
        const classIds = [...new Set(teacherTimetable.map(t => t.classId))];
        const classesQuery = query(collection(db, 'classes'), where('__name__', 'in', classIds));
        const classesSnapshot = await getDocs(classesQuery);
        const classesMap = new Map<string, Class>();
        classesSnapshot.forEach(doc => classesMap.set(doc.id, { ...doc.data(), id: doc.id } as Class));
        setClasses(classesMap);
      }

      setLoading(false);
    };

    fetchTimetable();
  }, [user]);

  if (loading) return <p>Loading timetable...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-black">
            {timetable.length > 0 ? (
              timetable.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{classes.get(t.classId)?.name || 'Unknown Class'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.dayOfWeek}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.startTime} - {t.endTime}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No classes scheduled.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

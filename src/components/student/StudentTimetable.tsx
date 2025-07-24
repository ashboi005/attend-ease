'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Timetable, Class, User } from '@/types';

interface EnrichedTimetable extends Timetable {
  className: string;
  classCode: string;
  teacherName: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudentTimetable() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Record<string, EnrichedTimetable[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStudentSchedule = async () => {
      setLoading(true);

      // 1. Find classes for the student
      const classesQuery = query(collection(db, 'classes'), where('studentIds', 'array-contains', user.uid));
      const classSnapshot = await getDocs(classesQuery);
      const studentClasses = classSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
      const classMap = new Map(studentClasses.map(c => [c.id, c]));

      if (studentClasses.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Fetch timetables for those classes
      const classIds = studentClasses.map(c => c.id);
      const timetableQuery = query(collection(db, 'timetables'), where('classId', 'in', classIds));
      const timetableSnapshot = await getDocs(timetableQuery);
      const timetables = timetableSnapshot.docs.map(doc => doc.data() as Timetable);

      // 3. Fetch teacher details for the timetables
      const teacherIds = [...new Set(timetables.map(t => t.teacherId))];
      if (teacherIds.length > 0) {
        const teachersQuery = query(collection(db, 'users'), where('__name__', 'in', teacherIds));
        const teachersSnapshot = await getDocs(teachersQuery);
        const teacherMap = new Map(teachersSnapshot.docs.map(doc => [doc.id, doc.data() as User]));

        // 4. Enrich timetable data and group by day
        const enrichedData = timetables.map(t => ({
          ...t,
          className: classMap.get(t.classId)?.name || 'Unknown',
          classCode: classMap.get(t.classId)?.code || 'N/A',
          teacherName: teacherMap.get(t.teacherId)?.displayName || 'Unknown Teacher',
        }));

        const groupedByDay = enrichedData.reduce((acc, item) => {
          const day = item.dayOfWeek;
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(item);
          return acc;
        }, {} as Record<string, EnrichedTimetable[]>);

        // Sort classes within each day by start time
        for (const day in groupedByDay) {
          groupedByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
        }

        setSchedule(groupedByDay);
      }
      
      setLoading(false);
    };

    fetchStudentSchedule();
  }, [user]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading your timetable...</p>;
  }

  return (
    <div className="space-y-8">
      {daysOfWeek.map(day => (
        schedule[day] && (
          <div key={day} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{day}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-black">Time</th>
                    <th className="py-2 px-4 border-b text-left text-black">Class</th>
                    <th className="py-2 px-4 border-b text-left text-black">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule[day].map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-black">{item.startTime} - {item.endTime}</td>
                      <td className="py-2 px-4 border-b text-black">{item.className} ({item.classCode})</td>
                      <td className="py-2 px-4 border-b text-black">{item.teacherName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ))}
      {Object.keys(schedule).length === 0 && !loading && (
        <p className="text-center text-gray-500">You have no classes scheduled.</p>
      )}
    </div>
  );
}

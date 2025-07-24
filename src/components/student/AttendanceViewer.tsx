'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Class, AttendanceRecord } from '@/types';

interface StudentAttendanceData {
  classInfo: Class;
  records: { date: string; status: string }[];
  summary: {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  };
}

export default function AttendanceViewer() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAttendance = async () => {
      setLoading(true);

      // 1. Find all classes the student is enrolled in
      const classesQuery = query(collection(db, 'classes'), where('studentIds', 'array-contains', user.uid));
      const classSnapshot = await getDocs(classesQuery);
      const studentClasses = classSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));

      if (studentClasses.length === 0) {
        setLoading(false);
        return;
      }

      const classIds = studentClasses.map(c => c.id);

      // 2. Fetch all attendance records for those classes
      const attendanceQuery = query(collection(db, 'attendance'), where('classId', 'in', classIds));
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const allRecords = attendanceSnapshot.docs.map(doc => doc.data() as AttendanceRecord);

      // 3. Process the data
      const processedData = studentClasses.map(classInfo => {
        const relevantRecords = allRecords.filter(r => r.classId === classInfo.id);
        const studentRecords = relevantRecords.map(r => ({
          date: r.date,
          status: r.records[user.uid],
        })).filter(r => r.status); // Filter out dates where student wasn't marked

        const summary = {
          present: studentRecords.filter(r => r.status === 'present').length,
          absent: studentRecords.filter(r => r.status === 'absent').length,
          late: studentRecords.filter(r => r.status === 'late').length,
          total: studentRecords.length,
          percentage: 0,
        };
        
        const attendedCount = summary.present + summary.late;
        summary.percentage = summary.total > 0 ? Math.round((attendedCount / summary.total) * 100) : 100;

        return {
          classInfo,
          records: studentRecords.sort((a, b) => b.date.localeCompare(a.date)), // Sort by most recent
          summary,
        };
      });

      setAttendanceData(processedData);
      setLoading(false);
    };

    fetchAttendance();
  }, [user]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading your attendance records...</p>;
  }

  if (attendanceData.length === 0) {
    return <p className="text-center text-gray-500">No attendance records found.</p>;
  }

  return (
    <div className="space-y-8">
      {attendanceData.map(data => (
        <div key={data.classInfo.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">{data.classInfo.name} ({data.classInfo.code})</h2>
            <div className="text-lg font-bold text-gray-700">
              Attendance: <span className={`${data.summary.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>{data.summary.percentage}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
            <div className="p-4 bg-green-100 rounded-lg"><span className="font-bold text-green-800">{data.summary.present}</span> Present</div>
            <div className="p-4 bg-yellow-100 rounded-lg"><span className="font-bold text-yellow-800">{data.summary.late}</span> Late</div>
            <div className="p-4 bg-red-100 rounded-lg"><span className="font-bold text-red-800">{data.summary.absent}</span> Absent</div>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-gray-700">Detailed Log</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-black">Date</th>
                  <th className="py-2 px-4 border-b text-left text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-black">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-black">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${record.status === 'present' ? 'bg-green-200 text-green-800' : ''}
                        ${record.status === 'absent' ? 'bg-red-200 text-red-800' : ''}
                        ${record.status === 'late' ? 'bg-yellow-200 text-yellow-800' : ''}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

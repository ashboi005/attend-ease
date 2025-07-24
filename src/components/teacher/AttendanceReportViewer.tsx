'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Class } from '@/types';

interface AttendanceData {
  date: string;
  status: 'present' | 'absent' | 'late';
  studentName: string;
}

interface Report {
  class: Class;
  totalSessions: number;
  attendanceData: AttendanceData[];
  averageAttendance: number;
  lowAttendanceStudents: { studentName: string; attendanceRate: number }[];
}

export default function AttendanceReportViewer() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch teacher's classes
  useEffect(() => {
    if (!user) return;
    const fetchAllClasses = async () => {
      // For now, fetch all classes (you might want to filter by teacher)
      const q = query(collection(db, 'classes'));
      const querySnapshot = await getDocs(q);
      const classData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
      setClasses(classData);
    };
    fetchAllClasses();
  }, [user]);

  const handleGenerateReport = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/attendance/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: selectedClassId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report.');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full md:w-1/2 px-4 py-2 border rounded-md text-black">
          <option value="">Select a class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
        </select>
        <button onClick={handleGenerateReport} disabled={!selectedClassId || loading} className="px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {report && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Class Overview</h3>
            <p className="text-gray-600">Class: {report.class.name} ({report.class.code})</p>
            <p className="text-gray-600">Total Sessions: {report.totalSessions}</p>
            <p className="text-gray-600">Average Attendance: {report.averageAttendance.toFixed(1)}%</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Attendance Students</h3>
            {report.lowAttendanceStudents.length > 0 ? (
              <ul className="space-y-2">
                {report.lowAttendanceStudents.map((student, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-gray-800">{student.studentName}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      student.attendanceRate < 50 ? 'bg-red-100 text-red-800' : 
                      student.attendanceRate < 75 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {student.attendanceRate.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No students have a low attendance rate. Great job!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

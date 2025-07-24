'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Class } from '@/types';

interface Report {
  overallPercentage: number;
  lowAttendanceStudents: { studentId: string; percentage: number }[];
  insights: string[];
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
    const fetchClasses = async () => {
      const q = query(collection(db, 'classes'), where('teacherId', '==', user.uid)); // This assumes a teacherId field on Class
      const querySnapshot = await getDocs(q);
      // A real implementation would fetch classes via timetables
      const classData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
      setClasses(classData);
    };
    // Simplified: In a real app, you'd get classes from the teacher's timetable.
    const fetchAllClasses = async () => {
        const q = query(collection(db, 'classes'));
        const querySnapshot = await getDocs(q);
        const classData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
        setClasses(classData);
    }
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
    } catch (err: any) {
      setError(err.message);
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
        <button onClick={handleGenerateReport} disabled={!selectedClassId || loading} className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {report && (
        <div className="space-y-6 pt-4 border-t">
          <h2 className="text-2xl font-semibold">Attendance Report for {classes.find(c => c.id === selectedClassId)?.name}</h2>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">AI-Powered Insights:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              {report.insights.map((insight, index) => <li key={index}>{insight}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Students with Low Attendance (&lt;75%)</h3>
            {report.lowAttendanceStudents.length > 0 ? (
              <ul className="space-y-2">
                {report.lowAttendanceStudents.map(student => (
                  <li key={student.studentId} className="flex justify-between p-2 bg-red-50 rounded-md">
                    <span className="text-red-800">Student ID: {student.studentId}</span>
                    <span className="font-bold text-red-600">{student.percentage}%</span>
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

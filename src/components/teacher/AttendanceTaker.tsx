'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Timetable, Class, User, AttendanceRecord } from '@/types';

export default function AttendanceTaker() {
  const { user } = useAuth();
  const [todaysClasses, setTodaysClasses] = useState<Timetable[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' }>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const today = new Date().toLocaleString('en-US', { weekday: 'long' }) as any;
  const todayDateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch teacher's classes for today
  useEffect(() => {
    if (!user) return;
    const fetchTodaysClasses = async () => {
      const q = query(collection(db, 'timetables'), where('teacherId', '==', user.uid), where('dayOfWeek', '==', today));
      const querySnapshot = await getDocs(q);
      const classes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Timetable));
      setTodaysClasses(classes);
    };
    fetchTodaysClasses();
  }, [user, today]);

  // Fetch students for the selected class
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const fetchStudentsAndAttendance = async () => {
      setLoading(true);
      setIsSubmitted(false);

      // Check for existing attendance record
      const attendanceQuery = query(collection(db, 'attendance'), 
        where('classId', '==', selectedClassId),
        where('teacherId', '==', user!.uid),
        where('date', '==', todayDateString)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      if (!attendanceSnapshot.empty) {
        const existingRecord = attendanceSnapshot.docs[0].data() as AttendanceRecord;
        setAttendance(existingRecord.records);
        setIsSubmitted(true);
      }

      // Fetch students
      const classDocRef = doc(db, 'classes', selectedClassId);
      const classSnap = await getDoc(classDocRef);
      if (classSnap.exists()) {
        const classData = classSnap.data() as Class;
        if (classData.studentIds && classData.studentIds.length > 0) {
          const studentsQuery = query(collection(db, 'users'), where('__name__', 'in', classData.studentIds));
          const studentsSnapshot = await getDocs(studentsQuery);
          const studentData = studentsSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
          setStudents(studentData);

          // Initialize attendance state if not already submitted
          if (attendanceSnapshot.empty) {
            const initialAttendance = studentData.reduce((acc, student) => {
              acc[student.uid] = 'present';
              return acc;
            }, {} as { [studentId: string]: 'present' | 'absent' | 'late' });
            setAttendance(initialAttendance);
          }
        } else {
          setStudents([]);
        }
      }
      setLoading(false);
    };

    fetchStudentsAndAttendance();
  }, [selectedClassId, user, todayDateString]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClassId || students.length === 0) return;

    await addDoc(collection(db, 'attendance'), {
      classId: selectedClassId,
      teacherId: user.uid,
      date: todayDateString,
      records: attendance,
    });
    setIsSubmitted(true);
    alert('Attendance submitted successfully!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">Select a Class:</label>
        <select id="class-select" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full px-4 py-2 border rounded-md text-black" disabled={todaysClasses.length === 0}>
          <option value="">{todaysClasses.length > 0 ? 'Select a class' : 'No classes scheduled for today'}</option>
          {todaysClasses.map(c => <option key={c.id} value={c.classId}>{c.classId}</option>)} {/* We need to fetch class name here */}
        </select>
      </div>

      {loading && <p>Loading students...</p>}

      {!loading && selectedClassId && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {students.length > 0 ? (
              students.map(student => (
                <div key={student.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <span className="text-gray-800 font-medium">{student.displayName}</span>
                  <div className="flex items-center gap-4">
                    {['present', 'absent', 'late'].map(status => (
                      <label key={status} className="flex items-center gap-1 text-black">
                        <input type="radio" name={`attendance-${student.uid}`} value={status} checked={attendance[student.uid] === status} onChange={() => handleStatusChange(student.uid, status as any)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" disabled={isSubmitted} />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No students enrolled in this class.</p>
            )}
          </div>
          {students.length > 0 && (
            <button type="submit" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400" disabled={isSubmitted}>
              {isSubmitted ? 'Attendance Submitted' : 'Submit Attendance'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

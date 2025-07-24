'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Timetable, Class, User, AttendanceRecord, SelectableClass } from '@/types';


export default function AttendanceTaker() {
  const { user } = useAuth();
  const [allClasses, setAllClasses] = useState<SelectableClass[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' }>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Helper function to get day of week
  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Generate available dates for a class based on its timetable
  const generateAvailableDates = (classId: string): string[] => {
    const dates: string[] = [];
    const today = new Date();
    const classSchedules = timetables.filter(t => t.classId === classId);

    // Add specific dates (one-time classes)
    classSchedules.forEach(schedule => {
      if (schedule.date) {
        const scheduleDate = new Date(schedule.date);
        if (scheduleDate >= today) {
          dates.push(schedule.date);
        }
      }
    });

    // Add recurring classes for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = getDayOfWeek(date.toISOString().split('T')[0]) as any;
      
      const hasRecurringClass = classSchedules.some(schedule => 
        !schedule.date && schedule.dayOfWeek === dayOfWeek
      );
      
      if (hasRecurringClass) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    // Remove duplicates and sort
    return [...new Set(dates)].sort();
  };

  // Fetch all classes and timetables for the teacher
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch timetables
        const timetableQuery = query(collection(db, 'timetables'), where('teacherId', '==', user.uid));
        const timetableSnapshot = await getDocs(timetableQuery);
        const timetableData = timetableSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Timetable));
        setTimetables(timetableData);

        // Get unique class IDs from timetables
        const classIds = [...new Set(timetableData.map(t => t.classId))];
        
        if (classIds.length > 0) {
          // Fetch class details
          const classPromises = classIds.map(async (classId) => {
            const classDoc = await getDoc(doc(db, 'classes', classId));
            if (classDoc.exists()) {
              const classData = classDoc.data() as Class;
              return { 
                id: classId, 
                name: classData.name, 
                subject: classData.code 
              } as SelectableClass;
            }
            return null;
          });

          const classDetails = (await Promise.all(classPromises)).filter(Boolean) as SelectableClass[];
          setAllClasses(classDetails);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Update available dates when class changes
  useEffect(() => {
    if (!selectedClassId) {
      setAvailableDates([]);
      setSelectedDate('');
      return;
    }

    const dates = generateAvailableDates(selectedClassId);
    setAvailableDates(dates);
    setSelectedDate('');
  }, [selectedClassId, timetables]);

  // Update available time slots when date changes
  useEffect(() => {
    if (!selectedClassId || !selectedDate) {
      setAvailableTimes([]);
      setSelectedTimeSlot('');
      return;
    }

    const dayOfWeek = getDayOfWeek(selectedDate);
    const timeSlotsForSelectedDay = timetables
      .filter(timetable => {
        if (timetable.classId !== selectedClassId) return false;
        
        if (timetable.date === selectedDate) return true;
        
        if (!timetable.date && timetable.dayOfWeek === dayOfWeek) return true;
        
        return false;
      })
      .map(timetable => `${timetable.startTime} - ${timetable.endTime}`);

    setAvailableTimes(timeSlotsForSelectedDay);
    setSelectedTimeSlot('');
  }, [selectedClassId, selectedDate, timetables]);

  // Fetch students for the selected class and check existing attendance
  useEffect(() => {
    if (!selectedClassId || !selectedDate || !selectedTimeSlot) {
      setStudents([]);
      setAttendance({});
      setIsSubmitted(false);
      return;
    }

    const fetchStudentsAndAttendance = async () => {
      setLoading(true);
      setIsSubmitted(false);

      // Check for existing attendance record
      const attendanceQuery = query(collection(db, 'attendance'), 
        where('classId', '==', selectedClassId),
        where('teacherId', '==', user!.uid),
        where('date', '==', selectedDate),
        where('timeSlot', '==', selectedTimeSlot)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      if (!attendanceSnapshot.empty) {
        const existingRecord = attendanceSnapshot.docs[0].data() as AttendanceRecord & { timeSlot: string };
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
  }, [selectedClassId, selectedDate, selectedTimeSlot, user]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClassId || !selectedDate || !selectedTimeSlot || students.length === 0) return;

    setLoading(true);
    try {
      const attendanceRecord: AttendanceRecord & { timeSlot: string } = {
        id: '',
        classId: selectedClassId,
        teacherId: user.uid,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        records: attendance
      };

      await addDoc(collection(db, 'attendance'), attendanceRecord);
      setIsSubmitted(true);
      alert('Attendance submitted successfully!');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Error submitting attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      {/* Class Selection */}
      <div>
        <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">Select a Class:</label>
        <select 
          id="class-select" 
          value={selectedClassId} 
          onChange={e => setSelectedClassId(e.target.value)} 
          className="w-full px-4 py-2 border rounded-md text-black" 
          disabled={allClasses.length === 0}
        >
          <option value="">{allClasses.length > 0 ? 'Select a class' : 'No classes available'}</option>
          {allClasses.map((c: SelectableClass) => (
            <option key={c.id} value={c.id}>{c.name}{c.subject ? ` - ${c.subject}` : ''}</option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      {selectedClassId && (
        <div>
          <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">Select Date:</label>
          <select 
            id="date-select" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            className="w-full px-4 py-2 border rounded-md text-black"
          >
            <option value="">Select a date</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
      )}

      {/* Time Slot Selection */}
      {selectedClassId && selectedDate && (
        <div>
          <label htmlFor="time-select" className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot:</label>
          <select 
            id="time-select" 
            value={selectedTimeSlot} 
            onChange={e => setSelectedTimeSlot(e.target.value)} 
            className="w-full px-4 py-2 border rounded-md text-black"
          >
            <option value="">Select time slot</option>
            {availableTimes.map((time: string) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <p>Loading students...</p>}

      {!loading && selectedClassId && selectedDate && selectedTimeSlot && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {students.length > 0 ? (
              students.map(student => (
                <div key={student.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <span className="text-gray-800 font-medium">{student.displayName}</span>
                  <div className="flex items-center gap-4">
                    {['present', 'absent', 'late'].map(status => (
                      <label key={status} className="flex items-center gap-1 text-black">
                        <input 
                          type="radio" 
                          name={`attendance-${student.uid}`} 
                          value={status} 
                          checked={attendance[student.uid] === status} 
                          onChange={() => handleStatusChange(student.uid, status as any)} 
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                          disabled={isSubmitted} 
                        />
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
            <button 
              type="submit" 
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400" 
              disabled={isSubmitted}
            >
              {isSubmitted ? 'Attendance Submitted' : 'Submit Attendance'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

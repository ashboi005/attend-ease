export interface Class {
  id: string;
  name: string;
  code: string;
  studentIds?: string[];
}

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  password?: string; // Optional password field for admin view
}

export interface Timetable {
  id: string;
  classId: string;
  teacherId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g., '09:00'
  endTime: string;   // e.g., '10:30'
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  records: { [studentId: string]: 'present' | 'absent' | 'late' };
}

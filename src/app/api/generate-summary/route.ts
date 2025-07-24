import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { AttendanceRecord, User, Class } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { classId } = await req.json();

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // 1. Fetch class details
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists()) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    const classData = classSnap.data() as Class;

    // 2. Fetch attendance records for the class
    const attendanceQuery = query(collection(db, 'attendance'), where('classId', '==', classId));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data() as AttendanceRecord);

    if (attendanceRecords.length === 0) {
      return NextResponse.json({ summary: 'No attendance records found for this class. Cannot generate a summary.' });
    }

    // 3. Fetch student details
    const studentIds = classData.studentIds || [];
    const students: { [id: string]: string } = {};
    if (studentIds.length > 0) {
      const studentsQuery = query(collection(db, 'users'), where('__name__', 'in', studentIds));
      const studentsSnapshot = await getDocs(studentsQuery);
      studentsSnapshot.forEach(doc => {
        const userData = doc.data() as User;
                students[doc.id] = userData.displayName;
      });
    }

    // 4. Construct a detailed prompt for the AI
    let prompt = `Analyze the following attendance data for the class "${classData.name}". Provide a concise summary of attendance patterns. Identify students with excellent (near 100%) attendance, students with poor attendance (frequently absent or late), and any noticeable trends (e.g., specific days with high absenteeism). Format the output clearly.\n\n`;

    prompt += 'Attendance Log:\n';
    attendanceRecords.sort((a, b) => a.date.localeCompare(b.date)).forEach(record => {
      prompt += `Date: ${record.date}\n`;
      Object.entries(record.records).forEach(([studentId, status]) => {
        const studentName = students[studentId] || 'Unknown Student';
        prompt += `- ${studentName}: ${status}\n`;
      });
    });

    // 5. Call the Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

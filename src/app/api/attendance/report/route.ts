import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { AttendanceRecord } from '@/types';

// A simple simulation of an AI analysis function
function generateAttendanceInsights(records: AttendanceRecord[]) {
  if (records.length === 0) {
    return {
      overallPercentage: 0,
      lowAttendanceStudents: [],
      insights: ['No attendance data available to generate a report.'],
    };
  }

  const studentStats: { [id: string]: { present: number; absent: number; late: number; total: number } } = {};
  let totalEntries = 0;
  let totalAttended = 0;

  for (const record of records) {
    for (const studentId in record.records) {
      if (!studentStats[studentId]) {
        studentStats[studentId] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      const status = record.records[studentId];
      studentStats[studentId][status]++;
      studentStats[studentId].total++;
      totalEntries++;
      if (status === 'present' || status === 'late') {
        totalAttended++;
      }
    }
  }

  const overallPercentage = totalEntries > 0 ? Math.round((totalAttended / totalEntries) * 100) : 0;

  const lowAttendanceStudents = Object.entries(studentStats)
    .map(([studentId, stats]) => {
      const percentage = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;
      return { studentId, percentage };
    })
    .filter(s => s.percentage < 75) // Threshold for low attendance
    .sort((a, b) => a.percentage - b.percentage);

  const insights = [
    `Overall class attendance is ${overallPercentage}%.
`,
    `${lowAttendanceStudents.length} student(s) have an attendance rate below 75%.`,
    'Consistent attendance is key to success. Consider reaching out to students with low attendance.',
  ];

  return { overallPercentage, lowAttendanceStudents, insights };
}

export async function POST(request: Request) {
  try {
    const { classId } = await request.json();

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Use Admin SDK to fetch attendance records
    const attendanceSnapshot = await adminDb.collection('attendance').where('classId', '==', classId).get();
    const records = attendanceSnapshot.docs.map(doc => doc.data() as AttendanceRecord);

    const report = generateAttendanceInsights(records);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

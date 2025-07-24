'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceChartProps {
  data: {
    present: number;
    absent: number;
    late: number;
  };
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = [
    {
      name: 'Attendance',
      Present: data.present,
      Absent: data.absent,
      Late: data.late,
    },
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <BarChart
            data={chartData}
            margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cccccc' }}
                labelStyle={{ color: '#212842' }}
            />
            <Legend />
            <Bar dataKey="Present" fill="#10B981" />
            <Bar dataKey="Absent" fill="#EF4444" />
            <Bar dataKey="Late" fill="#F59E0B" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}

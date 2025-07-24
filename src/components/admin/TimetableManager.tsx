'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timetable, Class, User } from '@/types';

export default function TimetableManager() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [newTimetable, setNewTimetable] = useState({ classId: '', teacherId: '', dayOfWeek: 'Monday', startTime: '', endTime: '' });
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch classes
      const classSnapshot = await getDocs(collection(db, 'classes'));
      setClasses(classSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class)));

      // Fetch teachers
      const teacherQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const teacherSnapshot = await getDocs(teacherQuery);
      setTeachers(teacherSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User)));

      // Fetch timetables
      const timetableSnapshot = await getDocs(collection(db, 'timetables'));
      setTimetables(timetableSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Timetable)));
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAddOrUpdateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    const { classId, teacherId, dayOfWeek, startTime, endTime } = editingTimetable || newTimetable;
    if (!classId || !teacherId || !dayOfWeek || !startTime || !endTime) return;

    if (editingTimetable) {
      const timetableDoc = doc(db, 'timetables', editingTimetable.id);
      await updateDoc(timetableDoc, { classId, teacherId, dayOfWeek, startTime, endTime });
      setTimetables(timetables.map(t => t.id === editingTimetable.id ? { ...editingTimetable } : t));
      setEditingTimetable(null);
    } else {
      const docRef = await addDoc(collection(db, 'timetables'), { classId, teacherId, dayOfWeek, startTime, endTime });
      setTimetables([...timetables, { id: docRef.id, classId, teacherId, dayOfWeek, startTime, endTime } as Timetable]);
    }
    setNewTimetable({ classId: '', teacherId: '', dayOfWeek: 'Monday', startTime: '', endTime: '' });
  };

  const handleDeleteTimetable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    await deleteDoc(doc(db, 'timetables', id));
    setTimetables(timetables.filter(t => t.id !== id));
  };

  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name || 'Unknown Class';
  const getTeacherName = (teacherId: string) => teachers.find(t => t.uid === teacherId)?.displayName || 'Unknown Teacher';

  if (loading) return <p>Loading timetable data...</p>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{editingTimetable ? 'Edit Schedule' : 'Add New Schedule'}</h2>
        <form onSubmit={handleAddOrUpdateTimetable} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={editingTimetable?.classId || newTimetable.classId} onChange={e => editingTimetable ? setEditingTimetable({...editingTimetable, classId: e.target.value}) : setNewTimetable({ ...newTimetable, classId: e.target.value })} className="w-full px-4 py-2 border rounded-md text-black" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={editingTimetable?.teacherId || newTimetable.teacherId} onChange={e => editingTimetable ? setEditingTimetable({...editingTimetable, teacherId: e.target.value}) : setNewTimetable({ ...newTimetable, teacherId: e.target.value })} className="w-full px-4 py-2 border rounded-md text-black" required>
            <option value="">Select Teacher</option>
            {teachers.map(t => <option key={t.uid} value={t.uid}>{t.displayName}</option>)}
          </select>
          <select value={editingTimetable?.dayOfWeek || newTimetable.dayOfWeek} onChange={e => editingTimetable ? setEditingTimetable({...editingTimetable, dayOfWeek: e.target.value as any}) : setNewTimetable({ ...newTimetable, dayOfWeek: e.target.value as any })} className="w-full px-4 py-2 border rounded-md text-black" required>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <option key={day} value={day}>{day}</option>)}
          </select>
          <input type="time" value={editingTimetable?.startTime || newTimetable.startTime} onChange={e => editingTimetable ? setEditingTimetable({...editingTimetable, startTime: e.target.value}) : setNewTimetable({ ...newTimetable, startTime: e.target.value })} className="w-full px-4 py-2 border rounded-md text-black" required />
          <input type="time" value={editingTimetable?.endTime || newTimetable.endTime} onChange={e => editingTimetable ? setEditingTimetable({...editingTimetable, endTime: e.target.value}) : setNewTimetable({ ...newTimetable, endTime: e.target.value })} className="w-full px-4 py-2 border rounded-md text-black" required />
          <div className="flex gap-4 md:col-span-3">
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">{editingTimetable ? 'Update' : 'Add Schedule'}</button>
            {editingTimetable && <button type="button" onClick={() => setEditingTimetable(null)} className="px-6 py-2 bg-gray-500 text-white rounded-md">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Class Schedules</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {timetables.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{getClassName(t.classId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTeacherName(t.teacherId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.dayOfWeek}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.startTime} - {t.endTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setEditingTimetable(t)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDeleteTimetable(t.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

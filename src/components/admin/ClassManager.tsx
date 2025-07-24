'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Class, User } from '@/types';

export default function ClassManager() {
  const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
    const [newClass, setNewClass] = useState({ name: '', code: '', teacherId: '' });
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch classes
      const classSnapshot = await getDocs(collection(db, 'classes'));
      setClasses(classSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class)));

      // Fetch students
      const studentQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentSnapshot = await getDocs(studentQuery);
      setStudents(studentSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User)));

      // Fetch teachers
      const teacherQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const teacherSnapshot = await getDocs(teacherQuery);
      setTeachers(teacherSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User)));
      setLoading(false);
    };

    fetchData();
  }, []);

    const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name.trim() || !newClass.code.trim() || !newClass.teacherId) {
      alert('Please fill all fields and select a teacher.');
      return;
    }

    try {
            const docRef = await addDoc(collection(db, 'classes'), newClass);
            setClasses([...classes, { ...newClass, id: docRef.id }]);
            setNewClass({ name: '', code: '', teacherId: '' });
    } catch (error) {
      console.error('Error adding class: ', error);
      alert('Failed to add class. Please check the console for more details.');
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const classDoc = doc(db, 'classes', editingClass.id);
    await updateDoc(classDoc, { 
      name: editingClass.name,
      code: editingClass.code,
      studentIds: editingClass.studentIds || [] 
    });

    setClasses(classes.map(c => c.id === editingClass.id ? editingClass : c));
    setEditingClass(null);
  };

      const handleStudentSelection = (studentId: string) => {
    if (!editingClass) return;

    const currentStudentIds = editingClass.studentIds || [];
    const isStudentInCurrentClass = currentStudentIds.includes(studentId);

    // Check if the student is being added to this class (not removed)
    if (!isStudentInCurrentClass) {
      // Check if the student is already in any other class
      const studentInAnotherClass = classes.some(c => 
        c.id !== editingClass.id && c.studentIds?.includes(studentId)
      );

      if (studentInAnotherClass) {
        alert('This student is already assigned to another class.');
        return; // Prevent adding the student
      }
    }

    const updatedStudentIds = isStudentInCurrentClass
      ? currentStudentIds.filter(id => id !== studentId) // Remove student
      : [...currentStudentIds, studentId]; // Add student

    setEditingClass({ ...editingClass, studentIds: updatedStudentIds });
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    await deleteDoc(doc(db, 'classes', id));
    setClasses(classes.filter(c => c.id !== id));
  };

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
        <form onSubmit={editingClass ? handleUpdateClass : handleAddClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" value={editingClass ? editingClass.name : newClass.name} onChange={(e) => editingClass ? setEditingClass({ ...editingClass, name: e.target.value }) : setNewClass({ ...newClass, name: e.target.value })} placeholder="Class Name (e.g., Computer Science)" className="w-full px-4 py-2 border rounded-md text-black" required />
                        <input type="text" value={editingClass ? editingClass.code : newClass.code} onChange={(e) => editingClass ? setEditingClass({ ...editingClass, code: e.target.value }) : setNewClass({ ...newClass, code: e.target.value })} placeholder="Class Code (e.g., CS101)" className="w-full px-4 py-2 border rounded-md text-black" required />
            {!editingClass && (
              <select value={newClass.teacherId} onChange={(e) => setNewClass({ ...newClass, teacherId: e.target.value })} className="w-full px-4 py-2 border rounded-md text-black" required>
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.uid} value={teacher.uid}>{teacher.displayName}</option>
                ))}
              </select>
            )}
          </div>

          {editingClass && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Enroll Students</h3>
              <div className="max-h-60 overflow-y-auto border rounded-md p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {students.map(student => (
                  <label key={student.uid} className="flex items-center space-x-2 text-black">
                    <input type="checkbox" checked={!!editingClass?.studentIds?.includes(student.uid)} onChange={() => handleStudentSelection(student.uid)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span>{student.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">{editingClass ? 'Update Class' : 'Add Class'}</button>
            {editingClass && <button type="button" onClick={() => setEditingClass(null)} className="px-6 py-2 bg-gray-500 text-white rounded-md">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Classes</h2>
        <ul className="space-y-4">
          {classes.map(c => (
            <li key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div>
                <p className="text-gray-800 font-medium">{c.name} ({c.code})</p>
                <p className="text-gray-500 text-sm">{c.studentIds?.length || 0} students enrolled</p>
              </div>
              <div className="space-x-4">
                <button onClick={() => setEditingClass(c)} className="text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => handleDeleteClass(c.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

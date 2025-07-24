'use client';

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export default function StudentManager() {
  const [students, setStudents] = useState<User[]>([]);
  const [newStudent, setNewStudent] = useState({ displayName: '', email: '', password: '' });
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
      setStudents(studentsData);
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newStudent.email || !newStudent.displayName || !newStudent.password) return;

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStudent, role: 'student' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student.');
      }

      setStudents([...students, data.user]);
      setNewStudent({ displayName: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const studentDoc = doc(db, 'users', editingStudent.uid);
    await updateDoc(studentDoc, { displayName: editingStudent.displayName });

    setStudents(students.map(s => s.uid === editingStudent.uid ? editingStudent : s));
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this student? This is irreversible.')) return;
    setError(null);

    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete student.');
      }

      setStudents(students.filter(s => s.uid !== uid));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePasswordVisibility = (uid: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [uid]: !prev[uid]
    }));
  };

  const copyPasswordToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      // You could add a toast notification here
      alert('Password copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy password:', err);
      alert('Failed to copy password to clipboard');
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="space-y-8">
      {/* Security Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Passwords are displayed here for administrative purposes only. Ensure this information is kept secure and accessed only by authorized personnel.
            </p>
          </div>
        </div>
      </div>
      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {editingStudent ? (
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <input
              type="text"
              value={editingStudent.displayName}
              onChange={(e) => setEditingStudent({ ...editingStudent, displayName: e.target.value })}
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-md text-black"
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">Update</button>
              <button type="button" onClick={() => setEditingStudent(null)} className="px-6 py-2 bg-gray-500 text-white rounded-md">Cancel</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddStudent} className="space-y-4">
            <input type="text" value={newStudent.displayName} onChange={(e) => setNewStudent({ ...newStudent, displayName: e.target.value })} placeholder="Full Name" className="w-full px-4 py-2 border rounded-md text-black" required />
            <input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="Email Address" className="w-full px-4 py-2 border rounded-md text-black" required />
            <input type="password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} placeholder="Password" className="w-full px-4 py-2 border rounded-md text-black" required />
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">Add Student</button>
          </form>
        )}
      </div>

      {/* Students List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Students</h2>
        <ul className="space-y-4">
          {students.map(student => (
            <li key={student.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{student.displayName}</p>
                <p className="text-gray-500 text-sm">{student.email}</p>
                <div className="flex items-center mt-2">
                  <span className="text-gray-600 text-sm mr-2">Password:</span>
                  <span className="text-gray-800 text-sm font-mono bg-gray-200 px-2 py-1 rounded mr-2">
                    {showPasswords[student.uid] 
                      ? (student.password || 'Not available')
                      : '••••••••'
                    }
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(student.uid)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm mr-2"
                  >
                    {showPasswords[student.uid] ? 'Hide' : 'Show'}
                  </button>
                  {student.password && (
                    <button
                      onClick={() => copyPasswordToClipboard(student.password!)}
                      className="text-green-600 hover:text-green-800 text-sm"
                      title="Copy password to clipboard"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
              <div className="space-x-4">
                <button onClick={() => setEditingStudent(student)} className="text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => handleDeleteStudent(student.uid)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

'use client';

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [newTeacher, setNewTeacher] = useState({ displayName: '', email: '', password: '' });
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const querySnapshot = await getDocs(q);
      const teachersData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
      setTeachers(teachersData);
      setLoading(false);
    };

    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newTeacher.email || !newTeacher.displayName || !newTeacher.password) return;

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTeacher, role: 'teacher' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create teacher.');
      }

      setTeachers([...teachers, data.user]);
      setNewTeacher({ displayName: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const teacherDoc = doc(db, 'users', editingTeacher.uid);
    await updateDoc(teacherDoc, { displayName: editingTeacher.displayName });

    setTeachers(teachers.map(t => t.uid === editingTeacher.uid ? editingTeacher : t));
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This is irreversible.')) return;
    setError(null);

    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete teacher.');
      }

      setTeachers(teachers.filter(t => t.uid !== uid));
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

  if (loading) return <p>Loading teachers...</p>;

  return (
    <div className="space-y-8">
      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {editingTeacher ? (
          <form onSubmit={handleUpdateTeacher} className="space-y-4">
            <input
              type="text"
              value={editingTeacher.displayName}
              onChange={(e) => setEditingTeacher({ ...editingTeacher, displayName: e.target.value })}
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-md text-black"
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">Update</button>
              <button type="button" onClick={() => setEditingTeacher(null)} className="px-6 py-2 bg-gray-500 text-white rounded-md">Cancel</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <input type="text" value={newTeacher.displayName} onChange={(e) => setNewTeacher({ ...newTeacher, displayName: e.target.value })} placeholder="Full Name" className="w-full px-4 py-2 border rounded-md text-black" required />
            <input type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} placeholder="Email Address" className="w-full px-4 py-2 border rounded-md text-black" required />
            <input type="password" value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} placeholder="Password" className="w-full px-4 py-2 border rounded-md text-black" required />
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md">Add Teacher</button>
          </form>
        )}
      </div>

      {/* Teachers List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Teachers</h2>
        <ul className="space-y-4">
          {teachers.map(teacher => (
            <li key={teacher.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{teacher.displayName}</p>
                <p className="text-gray-500 text-sm">{teacher.email}</p>
                <div className="flex items-center mt-2">
                  <span className="text-gray-600 text-sm mr-2">Password:</span>
                  <span className="text-gray-800 text-sm font-mono bg-gray-200 px-2 py-1 rounded mr-2">
                    {showPasswords[teacher.uid] 
                      ? (teacher.password || 'Not available')
                      : '••••••••'
                    }
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(teacher.uid)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm mr-2"
                  >
                    {showPasswords[teacher.uid] ? 'Hide' : 'Show'}
                  </button>
                  {teacher.password && (
                    <button
                      onClick={() => copyPasswordToClipboard(teacher.password!)}
                      className="text-green-600 hover:text-green-800 text-sm"
                      title="Copy password to clipboard"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
              <div className="space-x-4">
                <button onClick={() => setEditingTeacher(teacher)} className="text-indigo-600 hover:underline">Edit</button>
                <button onClick={() => handleDeleteTeacher(teacher.uid)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

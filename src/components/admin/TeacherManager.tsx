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
      <div className="p-6 rounded-lg shadow-md" style={{backgroundColor: 'white', border: '1px solid #E8DCC6'}}>
        <h2 className="text-2xl font-semibold mb-4" style={{color: '#212842'}}>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {editingTeacher ? (
          <form onSubmit={handleUpdateTeacher} className="space-y-4">
            <input
              type="text"
              value={editingTeacher.displayName}
              onChange={(e) => setEditingTeacher({ ...editingTeacher, displayName: e.target.value })}
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-md"
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#212842';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E8DCC6';
              }}
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 rounded-md transition-colors" style={{backgroundColor: '#212842', color: '#F0E7D5'}}>Update</button>
              <button type="button" onClick={() => setEditingTeacher(null)} className="px-6 py-2 rounded-md transition-colors" style={{backgroundColor: '#2D3548', color: '#F0E7D5'}}>Cancel</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <input 
              type="text" 
              value={newTeacher.displayName} 
              onChange={(e) => setNewTeacher({ ...newTeacher, displayName: e.target.value })} 
              placeholder="Full Name" 
              className="w-full px-4 py-2 border rounded-md" 
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => e.target.style.borderColor = '#212842'}
              onBlur={(e) => e.target.style.borderColor = '#E8DCC6'}
              required 
            />
            <input 
              type="email" 
              value={newTeacher.email} 
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} 
              placeholder="Email Address" 
              className="w-full px-4 py-2 border rounded-md" 
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => e.target.style.borderColor = '#212842'}
              onBlur={(e) => e.target.style.borderColor = '#E8DCC6'}
              required 
            />
            <input 
              type="password" 
              value={newTeacher.password} 
              onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} 
              placeholder="Password" 
              className="w-full px-4 py-2 border rounded-md" 
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => e.target.style.borderColor = '#212842'}
              onBlur={(e) => e.target.style.borderColor = '#E8DCC6'}
              required 
            />
            <button type="submit" className="px-6 py-2 rounded-md transition-colors" style={{backgroundColor: '#212842', color: '#F0E7D5'}}>Add Teacher</button>
          </form>
        )}
      </div>

      {/* Teachers List */}
      <div className="p-6 rounded-lg shadow-md" style={{backgroundColor: 'white', border: '1px solid #E8DCC6'}}>
        <h2 className="text-2xl font-semibold mb-4" style={{color: '#212842'}}>Existing Teachers</h2>
        <ul className="space-y-4">
          {teachers.map(teacher => (
            <li key={teacher.uid} className="flex items-center justify-between p-4 rounded-md" style={{backgroundColor: '#F0E7D5'}}>
              <div className="flex-1">
                <p className="font-medium" style={{color: '#212842'}}>{teacher.displayName}</p>
                <p className="text-sm" style={{color: '#2D3548'}}>{teacher.email}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2" style={{color: '#2D3548'}}>Password:</span>
                  <span className="text-sm font-mono px-2 py-1 rounded mr-2" style={{
                    backgroundColor: '#E8DCC6',
                    color: '#212842'
                  }}>
                    {showPasswords[teacher.uid] 
                      ? (teacher.password || 'Not available')
                      : '••••••••'
                    }
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(teacher.uid)}
                    className="text-sm mr-2 transition-colors"
                    style={{color: '#212842'}}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#2D3548'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#212842'}
                  >
                    {showPasswords[teacher.uid] ? 'Hide' : 'Show'}
                  </button>
                  {teacher.password && (
                    <button
                      onClick={() => copyPasswordToClipboard(teacher.password!)}
                      className="text-sm transition-colors"
                      style={{color: '#22c55e'}}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#16a34a'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#22c55e'}
                      title="Copy password to clipboard"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
              <div className="space-x-4">
                <button 
                  onClick={() => setEditingTeacher(teacher)} 
                  className="transition-colors"
                  style={{color: '#212842'}}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#2D3548';
                    (e.target as HTMLButtonElement).style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#212842';
                    (e.target as HTMLButtonElement).style.textDecoration = 'none';
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteTeacher(teacher.uid)} 
                  className="transition-colors"
                  style={{color: '#dc2626'}}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#b91c1c';
                    (e.target as HTMLButtonElement).style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = '#dc2626';
                    (e.target as HTMLButtonElement).style.textDecoration = 'none';
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

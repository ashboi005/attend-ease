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
      <div className="p-6 rounded-lg shadow-md" style={{backgroundColor: 'white', border: '1px solid #E8DCC6'}}>
        <h2 className="text-2xl font-semibold mb-4" style={{color: '#212842'}}>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        {editingStudent ? (
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <input
              type="text"
              value={editingStudent.displayName}
              onChange={(e) => setEditingStudent({ ...editingStudent, displayName: e.target.value })}
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-md"
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#212842'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#E8DCC6'}
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 rounded-md transition-colors" style={{backgroundColor: '#212842', color: '#F0E7D5'}}>Update</button>
              <button type="button" onClick={() => setEditingStudent(null)} className="px-6 py-2 rounded-md transition-colors" style={{backgroundColor: '#2D3548', color: '#F0E7D5'}}>Cancel</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddStudent} className="space-y-4">
            <input 
              type="text" 
              value={newStudent.displayName} 
              onChange={(e) => setNewStudent({ ...newStudent, displayName: e.target.value })} 
              placeholder="Full Name" 
              className="w-full px-4 py-2 border rounded-md" 
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#212842'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#E8DCC6'}
              required 
            />
            <input 
              type="email" 
              value={newStudent.email} 
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} 
              placeholder="Email Address" 
              className="w-full px-4 py-2 border rounded-md" 
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#212842'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#E8DCC6'}
              required 
            />
            <input 
              type="password" 
              value={newStudent.password} 
              onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} 
              placeholder="Password" 
              className="w-full px-4 py-2 border rounded-md" 
              style={{
                borderColor: '#E8DCC6',
                backgroundColor: 'white',
                color: '#212842'
              }}
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#212842'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#E8DCC6'}
              required 
            />
            <button type="submit" className="px-6 py-2 rounded-md transition-colors" style={{backgroundColor: '#212842', color: '#F0E7D5'}}>Add Student</button>
          </form>
        )}
      </div>

      {/* Students List */}
      <div className="p-6 rounded-lg shadow-md" style={{backgroundColor: 'white', border: '1px solid #E8DCC6'}}>
        <h2 className="text-2xl font-semibold mb-4" style={{color: '#212842'}}>Existing Students</h2>
        <ul className="space-y-4">
          {students.map(student => (
            <li key={student.uid} className="flex items-center justify-between p-4 rounded-md" style={{backgroundColor: '#F0E7D5'}}>
              <div className="flex-1">
                <p className="font-medium" style={{color: '#212842'}}>{student.displayName}</p>
                <p className="text-sm" style={{color: '#2D3548'}}>{student.email}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2" style={{color: '#2D3548'}}>Password:</span>
                  <span className="text-sm font-mono px-2 py-1 rounded mr-2" style={{
                    backgroundColor: '#E8DCC6',
                    color: '#212842'
                  }}>
                    {showPasswords[student.uid] 
                      ? (student.password || 'Not available')
                      : '••••••••'
                    }
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(student.uid)}
                    className="text-sm mr-2 transition-colors"
                    style={{color: '#212842'}}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#2D3548'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#212842'}
                  >
                    {showPasswords[student.uid] ? 'Hide' : 'Show'}
                  </button>
                  {student.password && (
                    <button
                      onClick={() => copyPasswordToClipboard(student.password!)}
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
                  onClick={() => setEditingStudent(student)} 
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
                  onClick={() => handleDeleteStudent(student.uid)} 
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

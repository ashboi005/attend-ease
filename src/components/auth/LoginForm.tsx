'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/user';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const role = await getUserRole(user.uid);

      if (role) {
        switch (role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'teacher':
            router.push('/teacher');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            setError('Invalid user role.');
            auth.signOut(); // Sign out the user if role is invalid
            break;
        }
      } else {
        setError('Could not determine user role.');
        auth.signOut(); // Sign out the user if role is not found
      }
    } catch (err: any) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    return (
    <>
      <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium"
          style={{color: '#212842'}}
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm"
          style={{
            borderColor: '#E8DCC6',
            backgroundColor: 'white',
            color: '#212842'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#212842';
            e.target.style.boxShadow = '0 0 0 2px rgba(33, 40, 66, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E8DCC6';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{color: '#212842'}}
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm"
          style={{
            borderColor: '#E8DCC6',
            backgroundColor: 'white',
            color: '#212842'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#212842';
            e.target.style.boxShadow = '0 0 0 2px rgba(33, 40, 66, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E8DCC6';
            e.target.style.boxShadow = 'none';
          }}
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
          style={{
            backgroundColor: '#212842',
            color: '#F0E7D5'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#2D3548';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#212842';
            }
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(33, 40, 66, 0.3)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
    <div className="mt-6 text-center text-sm" style={{color: '#2D3548'}}>
        <p className="font-bold" style={{color: '#212842'}}>For GDG Reviewers:</p>
        <p>Use the following credentials to access the admin panel:</p>
        <ul className="list-none p-0 mt-2 space-y-1">
          <li><strong>Admin Email:</strong> admin@gndu.in</li>
          <li><strong>Admin Password:</strong> admingndu</li>
        </ul>
        <p className="mt-2">Teacher and Student credentials can be created and viewed inside the admin panel after logging in.</p>
      </div>
    </>
  );
}

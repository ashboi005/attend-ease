import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Smart Attendance System</h1>
        <p className="text-center text-gray-600">Please sign in to continue</p>
        <LoginForm />
      </div>
    </main>
  );
}

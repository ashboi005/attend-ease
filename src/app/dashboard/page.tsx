export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Welcome to Your Dashboard</h1>
        <p className="text-center text-gray-600">You have successfully logged in.</p>
        {/* Role-specific content will be loaded here */}
      </div>
    </main>
  );
}

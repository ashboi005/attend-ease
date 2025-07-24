export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center" style={{backgroundColor: '#F0E7D5'}}>
      <div className="w-full max-w-4xl p-8 space-y-8 rounded-lg shadow-md" style={{backgroundColor: 'white', border: '1px solid #E8DCC6'}}>
        <h1 className="text-3xl font-bold text-center" style={{color: '#212842', fontFamily: 'var(--font-crimson), serif', fontWeight: 700}}>Admin Dashboard</h1>
        <p className="text-center" style={{color: '#2D3548', fontFamily: 'var(--font-crimson), serif', fontWeight: 400}}>Welcome, Admin!</p>
      </div>
    </main>
  );
}

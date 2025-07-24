export default function HomePage() {
  // The AuthProvider will handle redirection, so we can just show a loading state.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <p>Loading...</p>
    </main>
  );
}

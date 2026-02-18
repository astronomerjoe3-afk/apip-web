export default async function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  let health: any = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${apiBase}/health`, { cache: "no-store" });
    health = await res.json();
  } catch (e: any) {
    error = e?.message ?? "Failed to reach API";
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>APIP Web</h1>
      <p>Frontend deployed on Cloud Run. Backend health check below.</p>

      <h2>API</h2>
      <p><b>Base URL:</b> {apiBase}</p>

      <h3>Health</h3>
      {error ? (
        <pre style={{ color: "crimson" }}>{error}</pre>
      ) : (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      )}
    </main>
  );
}

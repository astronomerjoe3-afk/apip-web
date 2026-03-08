import { Suspense } from "react";

import RegisterClient from "./RegisterClient";

function RegisterFallback() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 480 }}>
      <h1>Create account</h1>
      <p>Loading registration...</p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterClient />
    </Suspense>
  );
}

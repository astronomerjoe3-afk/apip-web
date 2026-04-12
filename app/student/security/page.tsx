import { Suspense } from "react";

import StudentSecurityClient from "./StudentSecurityClient";

function SecurityFallback() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720, margin: "0 auto" }}>
      <h1>Secure your account</h1>
      <p>Loading your security settings...</p>
    </main>
  );
}

export default function StudentSecurityPage() {
  return (
    <Suspense fallback={<SecurityFallback />}>
      <StudentSecurityClient />
    </Suspense>
  );
}

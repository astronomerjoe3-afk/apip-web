import { Suspense } from "react";
import type { Metadata } from "next";

import authStyles from "../auth.module.css";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Cognispark account and start guided physics learning with real mission flow, feedback, and progression.",
};

function RegisterFallback() {
  return (
    <main className={authStyles.page}>
      <section className={authStyles.shell}>
        <div className={authStyles.brandPanel}>
          <div className={authStyles.brandHeader}>
            <div className={authStyles.brandLockup}>
              <div className={authStyles.brandMark}>C</div>
              <div>
                <p className={authStyles.brandName}>Cognispark</p>
                <p className={authStyles.brandTag}>Physics, mission by mission.</p>
              </div>
            </div>
          </div>
        </div>
        <div className={authStyles.formPanel}>
          <div className={authStyles.formCard}>
            <div className={authStyles.formHeader}>
              <p className={authStyles.eyebrow}>Create account</p>
              <h1>Loading registration...</h1>
            </div>
          </div>
        </div>
      </section>
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

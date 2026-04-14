import { Suspense } from "react";
import type { Metadata } from "next";

import authStyles from "../auth.module.css";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Cognispark to continue your physics missions, progress tracking, and student dashboard.",
};

function LoginFallback() {
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
              <p className={authStyles.eyebrow}>Student sign-in</p>
              <h1>Loading sign-in...</h1>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}

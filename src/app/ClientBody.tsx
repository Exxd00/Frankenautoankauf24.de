"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieConsent from "@/components/CookieConsent";
import FloatingButtons from "@/components/FloatingButtons";
import { captureGclid } from "@/lib/gclidTracking";

export function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  // Capture GCLID from URL on page load
  useEffect(() => {
    // Capture GCLID and traffic source data
    const gclidData = captureGclid();

    if (gclidData?.gclid) {
      console.log('📊 Google Ads visit detected');
      console.log('   GCLID:', gclidData.gclid);
      console.log('   Landing Page:', gclidData.landingPage);
    } else if (gclidData) {
      console.log('📊 Traffic source:', gclidData.source);
    }
  }, []);

  return (
    <ThemeProvider>
      <div className="antialiased">{children}</div>
      <FloatingButtons />
      <CookieConsent />
    </ThemeProvider>
  );
}

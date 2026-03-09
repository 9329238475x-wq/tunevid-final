import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | TuneVid",
  description:
    "Official TuneVid privacy policy for users and partners, including Google API Services disclosures and advertising cookie information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Legal
        </p>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Effective date: March 9, 2026 · Last updated: March 9, 2026
        </p>
      </div>

      <article className="legal-content rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p>
          This Privacy Policy describes how TuneVid handles personal and technical data when you use our websites,
          tools, and connected account features.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>Account details: email, display name, and profile image from sign-in providers.</li>
          <li>Content data: files you upload for processing and generated outputs.</li>
          <li>Technical logs: IP, browser, device metadata, and request diagnostics for security and reliability.</li>
          <li>OAuth tokens needed for actions you authorize, such as YouTube publishing.</li>
        </ul>

        <h2>2. Why We Process Data</h2>
        <ul>
          <li>To provide tool functionality and complete processing tasks you request.</li>
          <li>To authenticate users and protect accounts from abuse.</li>
          <li>To monitor stability, fix errors, and improve service performance.</li>
          <li>To satisfy legal and compliance obligations where required.</li>
        </ul>

        <h2>3. Google API Services Disclosure</h2>
        <p>
          TuneVid&apos;s use and transfer to any other app of information received from Google APIs adheres to the
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including Limited Use requirements.
        </p>
        <ul>
          <li>Google and YouTube data is used only for user-authorized features.</li>
          <li>We do not sell Google user data.</li>
          <li>We do not use Google user data for cross-site ad targeting.</li>
        </ul>

        <h2>4. Advertising, Cookies, and Analytics</h2>
        <p>
          We use cookies for core functionality, security, preferences, analytics, and ad delivery. If Google AdSense
          is active, third-party vendors may use cookies to serve ads based on prior visits to this and other sites.
        </p>
        <ul>
          <li>
            Manage ad personalization: <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>
          </li>
          <li>
            Industry opt-out portal: <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>
          </li>
        </ul>

        <h2>5. Data Retention</h2>
        <ul>
          <li>Temporary files are deleted after processing windows and cleanup cycles.</li>
          <li>Operational logs may be retained for security, fraud prevention, and incident response.</li>
          <li>You may contact us for account-related deletion or privacy support requests.</li>
        </ul>

        <h2>6. Data Sharing</h2>
        <p>
          We do not sell personal information. Data may be shared only with required infrastructure or API providers,
          and with authorities when legally required.
        </p>

        <h2>7. Security Measures</h2>
        <ul>
          <li>Encrypted data transfer over HTTPS/TLS.</li>
          <li>Controlled operational access and credential safeguards.</li>
          <li>Monitoring systems for abuse detection and threat mitigation.</li>
        </ul>

        <h2>8. Your Controls</h2>
        <ul>
          <li>
            Revoke Google account access: <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>
          </li>
          <li>Contact us for privacy support, account questions, or policy requests.</li>
        </ul>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          TuneVid is not intended for children under 13. If child data is submitted by mistake, contact us to request
          removal.
        </p>

        <h2>10. Policy Updates</h2>
        <p>
          We may update this policy to reflect product, legal, or compliance changes. Material updates are shown by
          revising the date at the top of this page.
        </p>

        <h2>11. Contact</h2>
        <p>
          Privacy contact: <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>
      </article>
    </div>
  );
}


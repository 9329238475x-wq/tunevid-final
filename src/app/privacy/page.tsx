export const metadata = {
  title: "Privacy Policy | TuneVid",
  description:
    "TuneVid Privacy Policy covering data collection, Google/YouTube API use, ad cookies, security, retention, and user rights.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Effective date: March 9, 2026 · Last updated: March 9, 2026
        </p>
      </div>

      <article className="legal-content rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p>
          This Privacy Policy explains how TuneVid collects, uses, and protects information when you use our
          website and services.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li>Account details such as name, email, and profile image when you sign in.</li>
          <li>Uploaded files (for example audio and image assets) required to process your requests.</li>
          <li>Technical data such as IP address, browser, device type, and request logs for security and diagnostics.</li>
          <li>OAuth credentials needed to perform authorized YouTube actions on your behalf.</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>To provide requested tool functionality and generate output files.</li>
          <li>To publish content to your YouTube account only when you explicitly request it.</li>
          <li>To operate, secure, debug, and improve the Service.</li>
          <li>To communicate service updates, support responses, and policy notices.</li>
        </ul>

        <h2>3. Google and YouTube API Data Use</h2>
        <p>
          TuneVid uses Google OAuth and YouTube API scopes only for user-authorized actions, such as channel
          verification and video upload workflows.
        </p>
        <p>
          TuneVid&apos;s use and transfer of information received from Google APIs adheres to the
          Google API Services User Data Policy, including Limited Use requirements.
        </p>
        <ul>
          <li>We do not sell Google or YouTube user data.</li>
          <li>We do not use Google user data for ad targeting or data brokerage.</li>
        </ul>

        <h2>4. Ads, Cookies, and Analytics</h2>
        <p>
          TuneVid may use cookies and similar technologies for essential site functionality, traffic analytics,
          and ad serving. If Google AdSense is enabled, Google and its partners may use cookies to show ads
          based on prior visits to this or other websites.
        </p>
        <ul>
          <li>You can control ad personalization from <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</li>
          <li>You can review partner opt-out options at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</li>
        </ul>

        <h2>5. Data Retention</h2>
        <ul>
          <li>Processing files are retained only as long as needed for the requested operation.</li>
          <li>Temporary uploads and generated outputs are periodically deleted by automated cleanup jobs.</li>
          <li>Operational logs may be retained for security, abuse prevention, and incident response.</li>
        </ul>

        <h2>6. Data Sharing</h2>
        <p>
          We do not sell personal data. We may share limited data with infrastructure providers,
          API providers, and compliance-required authorities strictly for service delivery or legal obligations.
        </p>

        <h2>7. Security</h2>
        <ul>
          <li>Encryption in transit (HTTPS/TLS).</li>
          <li>Access controls and token-handling safeguards.</li>
          <li>Monitoring and abuse detection to protect platform integrity.</li>
        </ul>

        <h2>8. Your Rights and Controls</h2>
        <ul>
          <li>You can revoke Google account access at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.</li>
          <li>You may request account-related support or data inquiries by email.</li>
        </ul>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect personal data from children.
        </p>

        <h2>10. Policy Updates</h2>
        <p>
          We may update this policy as the Service evolves. Material changes will be reflected by updating
          the date on this page.
        </p>

        <h2>11. Contact</h2>
        <p>
          Privacy and data questions: <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>
      </article>
    </div>
  );
}

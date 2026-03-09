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
          This Privacy Policy describes how TuneVid ("we", "our", "us") handles personal and technical data when
          you access TuneVid websites, tools, and connected features.
        </p>

        <h2>1. Data Categories</h2>
        <ul>
          <li>Identity and profile data: email, display name, and profile avatar.</li>
          <li>Content data: files you submit for processing and generated outputs.</li>
          <li>Usage and diagnostics: request logs, browser/device metadata, and error traces.</li>
          <li>Connected account tokens required for user-authorized integrations.</li>
        </ul>

        <h2>2. Purpose of Processing</h2>
        <ul>
          <li>Provide requested product features and process media workflows.</li>
          <li>Enable secure authentication and connected platform actions.</li>
          <li>Prevent abuse, secure infrastructure, and maintain service quality.</li>
          <li>Measure product performance and improve user experience.</li>
        </ul>

        <h2>3. Google API Services Disclosure</h2>
        <p>
          TuneVid&apos;s use and transfer to any other app of information received from Google APIs adheres to the
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <ul>
          <li>Google/YouTube data is used only for user-authorized functionality.</li>
          <li>We do not sell Google user data.</li>
          <li>We do not use Google user data for cross-site ad targeting.</li>
        </ul>

        <h2>4. Advertising and Cookie Notice</h2>
        <p>
          We may use cookies for authentication, preferences, analytics, and ad delivery. If Google AdSense or
          similar ad services are active, third-party vendors may use cookies to serve ads based on your visit
          history across websites.
        </p>
        <ul>
          <li>Manage ad personalization: <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a></li>
          <li>Industry opt-out portal: <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a></li>
        </ul>

        <h2>5. Retention and Deletion</h2>
        <ul>
          <li>Temporary processing files are automatically removed after operational completion windows.</li>
          <li>Platform logs may be retained for security, legal compliance, and fraud investigation.</li>
          <li>You may contact us to request account-related support or deletion assistance.</li>
        </ul>

        <h2>6. Data Sharing and Processors</h2>
        <p>
          We may share data only with service providers and APIs required to operate TuneVid, and with competent
          authorities when legally required. We do not sell personal information.
        </p>

        <h2>7. Security Practices</h2>
        <ul>
          <li>TLS-encrypted traffic in transit.</li>
          <li>Role-based operational access controls.</li>
          <li>Automated monitoring and threat mitigation controls.</li>
        </ul>

        <h2>8. User Controls</h2>
        <ul>
          <li>Revoke Google access: <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a></li>
          <li>Request support or privacy assistance by email.</li>
        </ul>

        <h2>9. Children&apos;s Data</h2>
        <p>
          TuneVid is not intended for children under 13. If you believe child data was provided in error,
          contact us for removal.
        </p>

        <h2>10. Contact</h2>
        <p>
          Privacy contact: <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>
      </article>
    </div>
  );
}

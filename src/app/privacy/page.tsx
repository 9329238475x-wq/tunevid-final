export const metadata = {
  title: "Privacy Policy | TuneVid",
  description:
    "TuneVid Privacy Policy including YouTube API Services data usage disclosures and legal commitments.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <article className="prose max-w-none dark:prose-invert">
        <h1 className="text-4xl font-bold text-zinc-100">Privacy Policy - TuneVid</h1>
        <p className="text-zinc-400">
          <strong>Effective Date:</strong> [DD/MM/YYYY]
          <br />
          <strong>Last Updated:</strong> [DD/MM/YYYY]
        </p>

        <h2>2.1 Information We Collect</h2>
        <ul className="text-zinc-400">
          <li>Account data (name, email) when you sign in.</li>
          <li>Uploaded media files (audio/image/video) for processing.</li>
          <li>Technical logs (IP, browser, device, timestamps) for security and diagnostics.</li>
          <li>OAuth tokens when you connect Google/YouTube account.</li>
        </ul>

        <h2>2.2 How We Use Data</h2>
        <ul className="text-zinc-400">
          <li>Requested tools (e.g., Vocal Remover, Video Visualizer, conversions) perform करने के लिए.</li>
          <li>YouTube upload requests execute करने के लिए (title, description, privacy settings etc.).</li>
          <li>Service reliability, fraud prevention, debugging, and support के लिए.</li>
          <li>Product improvement के लिए aggregated/non-personal analytics.</li>
        </ul>

        <h2>2.3 YouTube API Services Data Use</h2>
        <p className="text-zinc-400">
          TuneVid YouTube API Services और Google OAuth scopes का उपयोग केवल user-authorized actions
          (जैसे video upload/metadata update) के लिए करता है.
          <br />
          We do <strong>not</strong> sell YouTube user data.
          <br />
          We do <strong>not</strong> use Google user data for ad targeting, profiling, or data brokerage.
        </p>
        <p className="text-zinc-400">
          <strong>Required Disclosure:</strong>
          <br />
          TuneVid&apos;s use and transfer to any other app of information received from Google APIs will adhere
          to Google API Services User Data Policy, including the Limited Use requirements.
        </p>

        <h2>2.4 Data Sharing</h2>
        <ul className="text-zinc-400">
          <li>हम personal data third-party advertisers/data brokers को नहीं बेचते।</li>
          <li>Data sharing केवल trusted processors तक सीमित है, strictly service delivery के लिए।</li>
          <li>Legal obligation पर applicable law के अनुसार disclosure हो सकता है।</li>
        </ul>

        <h2>2.5 Data Retention</h2>
        <ul className="text-zinc-400">
          <li>Uploaded files processing completion के बाद limited retention window में delete किए जाते हैं.</li>
          <li>OAuth credentials encrypted form में रखे जाते हैं और केवल authorized workflows में उपयोग होते हैं.</li>
          <li>User request पर account-related data deletion process उपलब्ध है।</li>
        </ul>

        <h2>2.6 Security</h2>
        <ul className="text-zinc-400">
          <li>Encryption in transit (HTTPS/TLS).</li>
          <li>Access controls, token protection, server-side security monitoring.</li>
          <li>Principle of least privilege for internal access.</li>
        </ul>

        <h2>2.7 User Controls</h2>
        <p className="text-zinc-400">
          You can revoke Google access at:{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
            https://myaccount.google.com/permissions
          </a>
          <br />
          Data deletion/support requests:{" "}
          <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>

        <h2>2.8 Children&apos;s Privacy</h2>
        <p className="text-zinc-400">
          Service 13 वर्ष से कम आयु के बच्चों के लिए intended नहीं है। यदि अनजाने में ऐसा data collect
          होता है, हम उसे delete करेंगे।
        </p>

        <h2>2.9 Policy Updates</h2>
        <p className="text-zinc-400">
          यह policy समय-समय पर अपडेट हो सकती है। Material changes पर updated date और notice publish किया जाएगा।
        </p>

        <h2>2.10 Contact</h2>
        <p className="text-zinc-400">
          Privacy queries: <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>
      </article>
    </div>
  );
}

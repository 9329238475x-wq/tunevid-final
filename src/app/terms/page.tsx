export const metadata = {
  title: "Terms of Service | TuneVid",
  description:
    "TuneVid Terms of Service covering user responsibilities, YouTube API usage, service rules, and legal terms.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <article className="prose max-w-none dark:prose-invert">
        <h1 className="text-4xl font-bold text-zinc-100">Terms of Service - TuneVid</h1>
        <p className="text-zinc-400">
          <strong>Effective Date:</strong> [DD/MM/YYYY]
        </p>

        <h2>3.1 Acceptance</h2>
        <p className="text-zinc-400">
          TuneVid use करके आप इन Terms और हमारी Privacy Policy से सहमत होते हैं।
        </p>

        <h2>3.2 Services</h2>
        <p className="text-zinc-400">
          TuneVid AI audio/video processing tools प्रदान करता है (e.g., AI audio tools, Video Visualizer,
          YouTube automation support). Features समय के साथ बदल सकते हैं।
        </p>

        <h2>3.3 User Responsibilities</h2>
        <ul className="text-zinc-400">
          <li>आप केवल वही content upload करें जिसके लिए आपके पास rights/permissions हों।</li>
          <li>Illegal, infringing, abusive, or harmful content निषिद्ध है।</li>
          <li>Account security (credentials/password) की जिम्मेदारी user की होगी।</li>
        </ul>

        <h2>3.4 Intellectual Property</h2>
        <p className="text-zinc-400">
          User content का ownership user के पास रहता है। TuneVid platform, branding, software, UI assets TuneVid
          की property हैं। Unauthorized copying/reverse engineering prohibited है (जहाँ law permit न करे)।
        </p>

        <h2>3.5 YouTube API &amp; Third-Party Platforms</h2>
        <p className="text-zinc-400">
          YouTube integration use करने पर YouTube Terms और Developer Policies लागू होंगी। By using
          YouTube-connected features, you also agree to applicable Google/YouTube platform terms.
        </p>

        <h2>3.6 Availability &amp; Changes</h2>
        <p className="text-zinc-400">
          हम uptime maintain करने की कोशिश करते हैं, लेकिन uninterrupted service guarantee नहीं है।
          Maintenance, upgrades, and feature changes बिना prior notice हो सकते हैं।
        </p>

        <h2>3.7 Payments (if applicable)</h2>
        <p className="text-zinc-400">
          Paid plans/features होने पर pricing, renewal, cancellation और refund rules checkout/plan page पर
          defined होंगे।
        </p>

        <h2>3.8 Limitation of Liability</h2>
        <p className="text-zinc-400">
          Service &quot;as is&quot; basis पर प्रदान की जाती है। Law द्वारा permitted extent तक TuneVid indirect/
          consequential damages के लिए liable नहीं होगा।
        </p>

        <h2>3.9 Termination</h2>
        <p className="text-zinc-400">
          Policy violation या misuse पर access suspend/terminate किया जा सकता है।
        </p>

        <h2>3.10 Governing Law</h2>
        <p className="text-zinc-400">
          ये Terms [Your Jurisdiction/Country/State] के applicable laws द्वारा governed होंगे।
        </p>

        <h2>3.11 Contact</h2>
        <p className="text-zinc-400">
          Legal/support: <a href="mailto:9329238475x@gmail.com">9329238475x@gmail.com</a>
        </p>
      </article>
    </div>
  );
}

import { FileText } from "lucide-react";

export const metadata = {
    title: "Terms of Service",
    description: "TuneVid Terms of Service — rules and guidelines for using the audio processing platform and YouTube uploader.",
};

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-16 space-y-6">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Terms</p>
            </div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Terms of Service</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Last updated: February 2026</p>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm legal-content dark:border-zinc-800 dark:bg-zinc-950">
                <p>
                    Welcome to TuneVid. By using our website and services, you agree
                    to these Terms of Service. Please read them carefully.
                </p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using TuneVid.com, you agree to be bound by these
                    Terms. If you do not agree, please do not use our service.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    TuneVid provides a free tool to generate audio visualizer videos
                    from user-uploaded audio and image files, and publish them directly
                    to the user&apos;s YouTube channel via the YouTube Data API.
                </p>

                <h2>3. User Responsibilities</h2>
                <ul>
                    <li>
                        You must own or have the right to use all audio and image content
                        you upload.
                    </li>
                    <li>
                        You must not upload copyrighted material without proper
                        authorization.
                    </li>
                    <li>
                        You are solely responsible for all content published to your
                        YouTube channel through TuneVid.
                    </li>
                    <li>
                        You must comply with
                        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
                            YouTube&apos;s Terms of Service
                        </a> and Community Guidelines.
                    </li>
                </ul>

                <h2>4. Intellectual Property</h2>
                <p>
                    You retain full ownership of your uploaded content. TuneVid does
                    not claim any intellectual property rights over your files or
                    generated videos. Generated videos are published to your own
                    YouTube channel and belong to you.
                </p>

                <h2>5. YouTube API Compliance</h2>
                <p>
                    TuneVid uses YouTube API Services. By using TuneVid, you also
                    agree to the
                    <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
                        YouTube Terms of Service
                    </a> and acknowledge the
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                        Google Privacy Policy
                    </a>.
                </p>

                <h2>6. Limitation of Liability</h2>
                <p>
                    TuneVid is provided "as is" without warranties of any kind.
                    We are not liable for any damages arising from the use of our
                    service, including but not limited to: failed uploads, content
                    removal by YouTube, or loss of data.
                </p>

                <h2>7. Service Availability</h2>
                <p>
                    We strive to maintain service availability but do not guarantee
                    uninterrupted access. We may modify, suspend, or discontinue any
                    part of the service at any time.
                </p>

                <h2>8. Prohibited Uses</h2>
                <ul>
                    <li>Using automated tools or bots to access the service.</li>
                    <li>Uploading malicious files or attempting to exploit the system.</li>
                    <li>Using the service for spam, fraud, or illegal activities.</li>
                    <li>Circumventing file size limits or usage restrictions.</li>
                </ul>

                <h2>9. Termination</h2>
                <p>
                    We reserve the right to restrict or terminate your access to
                    TuneVid if you violate these Terms.
                </p>

                <h2>10. Changes to Terms</h2>
                <p>
                    We may update these Terms from time to time. Continued use of the
                    service after changes constitutes acceptance of the new Terms.
                </p>

                <h2>11. Contact</h2>
                <p>
                    Questions about these Terms? Contact us at
                    <a href="mailto:legal@tunevid.com">legal@tunevid.com</a>.
                </p>
            </div>
        </div>
    );
}

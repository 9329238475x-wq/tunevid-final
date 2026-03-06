import { Shield } from "lucide-react";

export const metadata = {
    title: "Privacy Policy",
    description: "TuneVid Privacy Policy — how we handle your data, YouTube API usage, and file processing. Your files are auto-deleted after processing.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-16 space-y-6">
            <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Privacy</p>
            </div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Last updated: February 2026</p>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm legal-content dark:border-zinc-800 dark:bg-zinc-950">
                <p>
                    TuneVid ("we", "our", or "us") respects your privacy. This
                    Privacy Policy explains how we collect, use, and protect information
                    when you use our website and services at TuneVid.com.
                </p>

                <h2>1. Information We Collect</h2>
                <h3>1.1 Files You Upload</h3>
                <p>
                    When you use TuneVid, you upload audio files (MP3/WAV) and image files
                    (JPG/PNG). These files are temporarily stored on our server solely
                    for the purpose of generating your visualizer video. They are
                    automatically deleted immediately after the video is uploaded to
                    YouTube.
                </p>

                <h3>1.2 YouTube / Google Account Data</h3>
                <p>
                    We use Google OAuth 2.0 to authenticate you and obtain a temporary
                    access token to upload videos to your YouTube channel. We access the
                    following scopes:
                </p>
                <ul>
                    <li><code>youtube.upload</code> — To upload videos to your channel.</li>
                    <li><code>youtube.readonly</code> — To verify your channel access.</li>
                    <li><code>openid, email, profile</code> — To display your name and avatar.</li>
                </ul>
                <p>
                    We do <strong>not</strong> store your access tokens, refresh tokens,
                    or any YouTube account data on our servers beyond the current session.
                </p>

                <h3>1.3 Automatically Collected Data</h3>
                <p>
                    We may collect standard web analytics data (IP address, browser type,
                    page views) to improve our service. This data is anonymized and not
                    linked to your identity.
                </p>

                <h2>2. How We Use Your Data</h2>
                <ul>
                    <li>To process your uploaded files and generate a visualizer video.</li>
                    <li>To upload the generated video to your YouTube channel on your behalf.</li>
                    <li>To display your profile information during your session.</li>
                    <li>To improve and maintain our service.</li>
                </ul>

                <h2>3. Data Retention & Deletion</h2>
                <p>
                    All uploaded files (audio, image) and generated videos are
                    <strong> permanently deleted</strong> from our servers immediately
                    after the YouTube upload is complete (or if an error occurs).
                    We do not keep copies of your files.
                </p>

                <h2>4. Third-Party Services</h2>
                <p>TuneVid uses the following third-party services:</p>
                <ul>
                    <li>
                        <strong>YouTube API Services</strong> — governed by the
                        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
                            YouTube Terms of Service
                        </a>.
                    </li>
                    <li>
                        <strong>Google OAuth 2.0</strong> — governed by the
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                            Google Privacy Policy
                        </a>.
                    </li>
                </ul>

                <h2>5. Revoking Access</h2>
                <p>
                    You can revoke TuneVid&apos;s access to your Google account at any time
                    by visiting your
                    <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
                        Google Account Permissions
                    </a> page.
                </p>

                <h2>6. Security</h2>
                <p>
                    We use industry-standard security measures (HTTPS, secure OAuth
                    flows) to protect your data during transmission and processing.
                </p>

                <h2>7. Children&apos;s Privacy</h2>
                <p>
                    TuneVid is not intended for children under 13. We do not knowingly
                    collect personal information from children.
                </p>

                <h2>8. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Any changes
                    will be posted on this page with an updated "Last updated"
                    date.
                </p>

                <h2>9. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact
                    us at <a href="mailto:privacy@tunevid.com">privacy@tunevid.com</a>.
                </p>
            </div>
        </div>
    );
}

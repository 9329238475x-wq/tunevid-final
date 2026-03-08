export const metadata = {
  title: "About Us | TuneVid",
  description:
    "TuneVid is an AI-powered audio studio that gives creators professional tools like Vocal Remover and Video Maker for free.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <article className="prose max-w-none dark:prose-invert">
        <h1 className="text-4xl font-bold text-zinc-100">About TuneVid</h1>
        <p className="text-zinc-400">
          TuneVid एक AI-powered audio studio है जिसे खास तौर पर creators, musicians, podcasters और
          YouTube publishers के लिए बनाया गया है। हमारा लक्ष्य simple है: बिना भारी software setup के,
          creators को ऐसे professional tools देना जिनसे वे तेज़ी से high-quality content बना सकें।
        </p>
        <p className="text-zinc-400">
          TuneVid पर आप Vocal Remover, Noise Reducer, Audio Converter, Silence Remover, Slowed + Reverb,
          Bass Booster और Video Maker/Visualizer जैसे practical tools एक ही जगह पर इस्तेमाल कर सकते हैं।
          हम workflow को fast, clean और creator-friendly बनाते हैं ताकि आप editing complexity में फंसे बिना
          publishing पर focus कर सकें।
        </p>
        <p className="text-zinc-400">
          हम independent creators को empower करने में विश्वास रखते हैं। इसी वजह से TuneVid का core experience
          accessible और creator-first रखा गया है। चाहे आप karaoke track बना रहे हों, remix stems तैयार कर रहे हों,
          या YouTube upload automation चाहते हों, TuneVid आपकी production journey को आसान, smart और scalable बनाता है।
        </p>
      </article>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type HistoryItem = {
  id: string;
  audio_name: string;
  image_name: string;
  created_at: string;
  status: string;
  download_url: string;
};

export default function UserHistory() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user?.email) return;
      const response = await fetch(
        `${API_BASE}/api/history?user_email=${encodeURIComponent(session.user.email)}`
      );
      if (!response.ok) return;
      const payload = await response.json();
      setHistory(payload);
    };

    fetchHistory();
  }, [session?.user?.email]);

  if (!session) {
    return (
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-300">Login to save your video history.</p>
        <button
          className="mt-3 rounded bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-200">Signed in as {session.user?.email}</p>
        </div>
        <button
          className="rounded bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-200">Your History</h3>
      {history.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">No videos generated yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-xs text-slate-300">
          {history.map((item) => (
            <li key={item.id} className="flex flex-wrap gap-2">
              <span>{item.audio_name}</span>
              <span>•</span>
              <span>{item.image_name}</span>
              <span>•</span>
              <span>{new Date(item.created_at).toLocaleString()}</span>
              <span>•</span>
              <span className="capitalize text-slate-400">{item.status}</span>
              <span>•</span>
              <a className="text-sky-400" href={`${API_BASE}${item.download_url}`}>
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


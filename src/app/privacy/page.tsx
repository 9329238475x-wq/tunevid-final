import { redirect } from "next/navigation";

export const metadata = {
  title: "Privacy Policy | TuneVid",
  description: "Redirects to the canonical TuneVid privacy policy page.",
};

export default function PrivacyPage() {
  redirect("/privacy-policy");
}


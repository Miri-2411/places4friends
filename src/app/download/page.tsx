import type { Metadata } from "next";
import DownloadRedirect from "@/components/DownloadRedirect";

export const metadata: Metadata = {
  title: "App laden",
  description:
    "Lade places4friends für iPhone und Android - teile deine Lieblingsorte mit deinen Freunden.",
  // Pure hand-off page: it should not compete with the landing page in search.
  robots: {
    index: false,
    follow: true,
  },
};

export default function DownloadPage() {
  return <DownloadRedirect />;
}

import ShortenerClient from "@/components/ShortenerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qviklink — Fast & Free URL Shortener",
  description:
    "Create short, memorable links instantly with Qviklink. No sign-up required. Fast, secure, and free URL shortening.",
};


export default function HomePage() {
  return <ShortenerClient />;
}

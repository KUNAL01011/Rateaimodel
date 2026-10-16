import type { Metadata } from "next";
import { pageMetadata } from "@/lib/server-api";
import HomeClient from "@/components/HomeClient";

export const revalidate = 120;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/");
}

export default function Page() {
  return <HomeClient />;
}

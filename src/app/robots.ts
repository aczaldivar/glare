import { getSiteUrl } from "@/lib/constants";

export default function robots() {
  const site = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site}/sitemap.xml`,
  };
}

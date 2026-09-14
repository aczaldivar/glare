import { getSiteUrl } from "@/lib/constants";

export default function sitemap() {
  const site = getSiteUrl();
  return [
    { url: site, lastModified: new Date() },
    { url: `${site}/r/lobby`, lastModified: new Date() },
  ];
}

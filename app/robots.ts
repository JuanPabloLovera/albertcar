import type { MetadataRoute } from "next";

import { publicBusinessConfig } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${publicBusinessConfig.siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}

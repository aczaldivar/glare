import type { NextConfig } from "next";
import { DEFAULT_OPERATOR_CONTACT_EMAIL } from "./src/lib/constants";
import { securityHeaders } from "./src/lib/security-headers";

const operatorEmail =
  process.env.NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL?.trim() ||
  process.env.OPERATOR_CONTACT_EMAIL?.trim() ||
  DEFAULT_OPERATOR_CONTACT_EMAIL;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL: operatorEmail,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
};

export default nextConfig;

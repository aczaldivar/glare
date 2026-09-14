import type { NextConfig } from "next";

const operatorEmail =
  process.env.NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL?.trim() ||
  process.env.OPERATOR_CONTACT_EMAIL?.trim() ||
  "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL: operatorEmail,
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import { DEFAULT_OPERATOR_CONTACT_EMAIL } from "./src/lib/constants";

const operatorEmail =
  process.env.NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL?.trim() ||
  process.env.OPERATOR_CONTACT_EMAIL?.trim() ||
  DEFAULT_OPERATOR_CONTACT_EMAIL;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL: operatorEmail,
  },
};

export default nextConfig;

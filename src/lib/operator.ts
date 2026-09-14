import { DEFAULT_OPERATOR_CONTACT_EMAIL } from "@/lib/constants";

export function getOperatorContactEmail() {
  const fromPublic = process.env.NEXT_PUBLIC_OPERATOR_CONTACT_EMAIL?.trim();
  if (fromPublic) return fromPublic;
  const fromOperator = process.env.OPERATOR_CONTACT_EMAIL?.trim();
  if (fromOperator) return fromOperator;
  return DEFAULT_OPERATOR_CONTACT_EMAIL;
}

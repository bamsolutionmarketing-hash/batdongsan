import { NextResponse } from "next/server";

// PayOS webhook — SCAFFOLD. Wire real checksum verify + subscription upsert
// (service role) when PAYOS_CHECKSUM_KEY is provided. Idempotent by order code.
export async function POST(req: Request) {
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!checksumKey) {
    return NextResponse.json({ ok: false, error: "PayOS not configured" }, { status: 501 });
  }
  // TODO: read body, verify signature against checksumKey, then upsert
  // subscriptions (service client) keyed by payos_order_code (unique → idempotent).
  await req.text();
  return NextResponse.json({ ok: true });
}

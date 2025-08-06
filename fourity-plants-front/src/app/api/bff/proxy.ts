import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Replace with your secret key
const HMAC_SECRET = process.env.HMAC_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { url, method = "POST", headers = {}, body } = await req.json();

    // Prepare body for signing and sending
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);

    // Create HMAC signature
    const signature = crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(bodyString)
      .digest("hex");

    // Add signature to headers
    const proxiedHeaders = {
      ...headers,
      "X-HMAC-Signature": signature,
      "Content-Type": "application/json",
    };

    // Proxy the request
    const proxiedResponse = await fetch(url, {
      method,
      headers: proxiedHeaders,
      body: bodyString,
    });

    const responseBody = await proxiedResponse.text();

    return new NextResponse(responseBody, {
      status: proxiedResponse.status,
      headers: {
        "content-type":
          proxiedResponse.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Proxy error", details: String(error) },
      { status: 500 },
    );
  }
}

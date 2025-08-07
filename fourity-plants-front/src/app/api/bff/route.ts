import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export async function POST(req: NextRequest) {
  try {
    const { method = "POST", headers = {}, body } = await req.json();
    const url =
      "https://km5vtry5xcfu2xzboyytvu43i40vnzms.lambda-url.eu-central-1.on.aws/";
    console.log(body);

    const bodyString = typeof body === "string" ? body : JSON.stringify(body);
    const hmacSecret = process.env.HMAC_SECRET;
    if (!hmacSecret) throw new Error("HMAC_SECRET is not defined");
    const signature = crypto
      .createHmac("sha256", hmacSecret)
      .update(bodyString)
      .digest("hex");

    const proxiedHeaders = {
      ...headers,
      "X-HMAC-Signature": signature,
      "Content-Type": "application/json",
    };

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

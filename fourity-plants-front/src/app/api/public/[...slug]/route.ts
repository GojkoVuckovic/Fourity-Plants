import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const safeSlug = slug.map((s) => s.replace(/\.\./g, ""));
    const filePath = path.join(process.cwd(), "public", "plants", ...safeSlug);

    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse(null, { status: 404 });
    }

    const file = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".json": "application/json",
    };

    return new NextResponse(file, {
      headers: {
        "Content-Type": mimeTypes[extension] || "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error serving public file:", error);
    return new NextResponse(null, { status: 500 });
  }
}

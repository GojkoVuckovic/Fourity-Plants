import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const uuid = formData.get("uuid") as string | null;
    console.log(file);
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!uuid || typeof uuid !== "string" || !uuid.match(/^[a-zA-Z0-9-]+$/)) {
      return NextResponse.json(
        { error: "Invalid or missing uuid" },
        { status: 400 },
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 },
      );
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(buffer);

    let webpBuffer;
    let quality = 80;
    let width = 800;
    const MAX_SIZE = 2 * 1024 * 1024;

    try {
      while (true) {
        webpBuffer = await sharp(buffer)
          .resize({ width })
          .webp({ quality })
          .toBuffer();

        if (webpBuffer.length <= MAX_SIZE || (quality <= 40 && width <= 400)) {
          break;
        }
        if (quality > 40) quality -= 10;
        else if (width > 400) width -= 100;
        else break;
      }
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 500 },
      );
    }

    const fileName = `${uuid}.webp`;
    const filePath = path.join(process.cwd(), "public", "plants", fileName);
    console.log(filePath);

    await writeFile(filePath, webpBuffer);
    console.log("write file");

    return NextResponse.json({
      success: true,
      filePath: `/plants/${fileName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

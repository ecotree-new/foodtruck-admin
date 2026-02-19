import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename과 contentType은 필수입니다" },
        { status: 400 }
      );
    }

    const ext = filename.split(".").pop() || "bin";
    const key = `attachments/${randomUUID()}.${ext}`;

    const { signedUrl, fileUrl } = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({
      signedUrl,
      fileUrl,
      originalFilename: filename,
    });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

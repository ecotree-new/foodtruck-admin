import { NextRequest, NextResponse } from "next/server";
import { deleteR2Object } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "fileUrl은 필수입니다" }, { status: 400 });
    }

    const r2PublicUrl = process.env.R2_PUBLIC_URL || "";
    if (!fileUrl.startsWith(r2PublicUrl)) {
      return NextResponse.json({ error: "유효하지 않은 URL입니다" }, { status: 400 });
    }

    const key = fileUrl.replace(`${r2PublicUrl}/`, "");
    await deleteR2Object(key);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/r2";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, contentType, eventId } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename과 contentType은 필수입니다" },
        { status: 400 }
      );
    }

    const ext = filename.split(".").pop() || "jpg";
    const key = `images/${randomUUID()}.${ext}`;

    const { signedUrl, fileUrl } = await getPresignedUploadUrl(key, contentType);

    // Save image metadata to Supabase
    const { data, error } = await supabase
      .from("images")
      .insert({
        r2_key: key,
        url: fileUrl,
        original_filename: filename,
        content_type: contentType,
        event_id: eventId || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl,
      fileUrl,
      imageId: data.id,
    });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

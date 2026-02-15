import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { deleteR2Object } from "@/lib/r2";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get image metadata
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: "이미지를 찾을 수 없습니다" }, { status: 404 });
    }

    // Delete from R2
    await deleteR2Object(image.r2_key);

    // Delete metadata from Supabase
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

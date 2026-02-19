import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { deleteR2Object } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "공지를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { title, content, is_published, attachment_url, attachment_filename } = body;

    // 기존 attachment 조회 (변경/제거 시 R2 정리)
    if (attachment_url !== undefined) {
      const { data: existing } = await supabase
        .from("notices")
        .select("attachment_url")
        .eq("id", id)
        .single();

      const r2PublicUrl = process.env.R2_PUBLIC_URL || "";
      if (existing?.attachment_url && existing.attachment_url !== attachment_url && existing.attachment_url.startsWith(r2PublicUrl)) {
        const key = existing.attachment_url.replace(`${r2PublicUrl}/`, "");
        await deleteR2Object(key).catch(() => {});
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (attachment_url !== undefined) updateData.attachment_url = attachment_url;
    if (attachment_filename !== undefined) updateData.attachment_filename = attachment_filename;

    const { data, error } = await supabase
      .from("notices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 첨부파일 R2 정리
  const { data: notice } = await supabase
    .from("notices")
    .select("attachment_url")
    .eq("id", id)
    .single();

  if (notice?.attachment_url) {
    const r2PublicUrl = process.env.R2_PUBLIC_URL || "";
    if (notice.attachment_url.startsWith(r2PublicUrl)) {
      const key = notice.attachment_url.replace(`${r2PublicUrl}/`, "");
      await deleteR2Object(key).catch(() => {});
    }
  }

  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { deleteR2Object } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "행사를 찾을 수 없습니다" }, { status: 404 });
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
    const { title, content, cover_image_url, is_published } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data, error } = await supabase
      .from("events")
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

  try {
    // 행사 데이터 조회 (본문에서 이미지 URL 추출용)
    const { data: event } = await supabase
      .from("events")
      .select("content, cover_image_url")
      .eq("id", id)
      .single();

    if (event) {
      // 본문 마크다운에서 이미지 URL 추출 + 커버 이미지
      const r2PublicUrl = process.env.R2_PUBLIC_URL || "";
      const imageUrls: string[] = [];

      if (event.cover_image_url?.startsWith(r2PublicUrl)) {
        imageUrls.push(event.cover_image_url);
      }

      const imgRegex = /!\[.*?\]\((.*?)\)/g;
      let match;
      while ((match = imgRegex.exec(event.content || "")) !== null) {
        if (match[1].startsWith(r2PublicUrl)) {
          imageUrls.push(match[1]);
        }
      }

      // R2에서 이미지 삭제 + images 테이블 정리
      for (const url of imageUrls) {
        const key = url.replace(`${r2PublicUrl}/`, "");
        await deleteR2Object(key).catch(() => {});
        await supabase.from("images").delete().eq("url", url);
      }
    }

    // 행사 삭제
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다" }, { status: 500 });
  }
}

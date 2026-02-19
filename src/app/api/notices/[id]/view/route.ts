import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase.rpc("increment_view_count", {
    table_name: "notices",
    row_id: id,
  });

  if (error) {
    // Fallback: manual increment
    const { data: notice } = await supabase
      .from("notices")
      .select("view_count")
      .eq("id", id)
      .single();

    if (!notice) {
      return NextResponse.json({ error: "공지를 찾을 수 없습니다" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("notices")
      .update({ view_count: (notice.view_count || 0) + 1 })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ view_count: (notice.view_count || 0) + 1 });
  }

  return NextResponse.json({ view_count: data });
}

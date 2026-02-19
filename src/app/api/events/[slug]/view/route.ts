import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Find event by slug first
  const { data: event } = await supabase
    .from("events")
    .select("id, view_count")
    .eq("slug", slug)
    .single();

  if (!event) {
    return NextResponse.json({ error: "행사를 찾을 수 없습니다" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("events")
    .update({ view_count: (event.view_count || 0) + 1 })
    .eq("id", event.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ view_count: (event.view_count || 0) + 1 });
}

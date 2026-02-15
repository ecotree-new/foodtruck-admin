import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "공지를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json(data);
}

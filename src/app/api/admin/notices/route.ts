import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const search = searchParams.get("search") || "";

  let query = supabase
    .from("notices")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, is_published, attachment_url, attachment_filename } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용은 필수입니다" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notices")
      .insert({
        title,
        content,
        is_published: is_published ?? true,
        attachment_url: attachment_url || null,
        attachment_filename: attachment_filename || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
}

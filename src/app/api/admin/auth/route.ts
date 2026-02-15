import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSession, getSessionCookieOptions, getLogoutCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, password } = body;

    if (action === "login") {
      if (!password) {
        return NextResponse.json({ error: "비밀번호를 입력해주세요" }, { status: 400 });
      }

      const valid = await verifyPassword(password);
      if (!valid) {
        return NextResponse.json({ error: "비밀번호가 올바르지 않습니다" }, { status: 401 });
      }

      const token = await createSession();
      const response = NextResponse.json({ success: true });
      const cookieOptions = getSessionCookieOptions(token);
      response.cookies.set(cookieOptions);
      return response;
    }

    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      const cookieOptions = getLogoutCookieOptions();
      response.cookies.set(cookieOptions);
      return response;
    }

    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

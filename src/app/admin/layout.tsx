"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/admin/notices", label: "공지사항" },
  { href: "/admin/events", label: "행사 갤러리" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
        <div className="px-5 py-5">
          <h1 className="font-bold text-lg">푸드트럭 관리자</h1>
        </div>
        <Separator />
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-md text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="border-b bg-background px-10 py-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {navItems.find((item) => pathname.startsWith(item.href))?.label ?? "관리자"}
          </h2>
          <span className="text-sm text-muted-foreground">푸드트럭 CMS</span>
        </header>
        <main className="flex-1 px-10 py-8">{children}</main>
      </div>
    </div>
  );
}

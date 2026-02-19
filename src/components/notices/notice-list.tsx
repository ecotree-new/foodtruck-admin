"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Notice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export default function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices(query?: string) {
    try {
      const params = new URLSearchParams();
      const q = query ?? search;
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/notices?${params}`);
      const json = await res.json();
      setNotices(json.data || []);
    } catch {
      console.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch {
      console.error("Failed to delete notice");
    }
  }

  async function handleTogglePublish(notice: Notice) {
    try {
      await fetch(`/api/admin/notices/${notice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !notice.is_published }),
      });
      setNotices((prev) =>
        prev.map((n) =>
          n.id === notice.id ? { ...n, is_published: !n.is_published } : n
        )
      );
    } catch {
      console.error("Failed to toggle publish");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">공지사항</h2>
        <Button asChild>
          <Link href="/admin/notices/new">새 공지 작성</Link>
        </Button>
      </div>

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          fetchNotices();
        }}
      >
        <Input
          placeholder="제목 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">검색</Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearch("");
              fetchNotices("");
            }}
          >
            초기화
          </Button>
        )}
      </form>

      {notices.length === 0 ? (
        <p className="text-muted-foreground">공지사항이 없습니다.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="w-20">조회수</TableHead>
              <TableHead className="w-40">작성일</TableHead>
              <TableHead className="w-48">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.map((notice) => (
              <TableRow key={notice.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/notices/${notice.id}`} className="hover:underline">
                    {notice.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={notice.is_published ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleTogglePublish(notice)}
                  >
                    {notice.is_published ? "공개" : "비공개"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {notice.view_count ?? 0}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/notices/${notice.id}`}>보기</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/notices/${notice.id}/edit`}>수정</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>공지 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{notice.title}&quot;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(notice.id)}>
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

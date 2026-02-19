"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

interface Event {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents(query?: string) {
    try {
      const params = new URLSearchParams();
      const q = query ?? search;
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/events?${params}`);
      const json = await res.json();
      setEvents(json.data || []);
    } catch {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      console.error("Failed to delete event");
    }
  }

  async function handleTogglePublish(event: Event) {
    try {
      await fetch(`/api/admin/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !event.is_published }),
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, is_published: !e.is_published } : e
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
        <h2 className="text-2xl font-bold">행사 갤러리</h2>
        <Button asChild>
          <Link href="/admin/events/new">새 행사 작성</Link>
        </Button>
      </div>

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          fetchEvents();
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
              fetchEvents("");
            }}
          >
            초기화
          </Button>
        )}
      </form>

      {events.length === 0 ? (
        <p className="text-muted-foreground">행사가 없습니다.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">커버</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-24">상태</TableHead>
              <TableHead className="w-20">조회수</TableHead>
              <TableHead className="w-40">작성일</TableHead>
              <TableHead className="w-48">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  {event.cover_image_url ? (
                    <img
                      src={event.cover_image_url}
                      alt=""
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      없음
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/admin/events/${event.id}`} className="hover:underline">
                    {event.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={event.is_published ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleTogglePublish(event)}
                  >
                    {event.is_published ? "공개" : "비공개"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {event.view_count ?? 0}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(event.created_at).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/events/${event.id}`}>보기</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/events/${event.id}/edit`}>수정</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>행사 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{event.title}&quot;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id)}>
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

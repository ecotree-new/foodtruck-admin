"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MdxEditor = dynamic(() => import("@/components/editor/mdx-editor"), {
  ssr: false,
  loading: () => <div className="border rounded-md min-h-[300px] flex items-center justify-center text-muted-foreground">에디터 로딩 중...</div>,
});

interface NoticeFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    is_published: boolean;
  };
}

export default function NoticeForm({ initialData }: NoticeFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isEdit = !!initialData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/notices/${initialData.id}`
        : "/api/admin/notices";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, is_published: isPublished }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "저장에 실패했습니다");
      }

      const saved = await res.json();
      router.push(`/admin/notices/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="공지 제목을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>내용</Label>
        <MdxEditor
          markdown={content}
          onChange={setContent}
          placeholder="공지 내용을 입력하세요"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is_published">공개</Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "저장 중..." : isEdit ? "수정" : "작성"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}

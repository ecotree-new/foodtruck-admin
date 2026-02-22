"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Notice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  attachment_url: string | null;
  attachment_filename: string | null;
  created_at: string;
  updated_at: string;
}

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotice() {
      try {
        const res = await fetch(`/api/admin/notices/${params.id}`);
        if (res.ok) {
          setNotice(await res.json());
        }
      } catch {
        console.error("Failed to fetch notice");
      } finally {
        setLoading(false);
      }
    }
    fetchNotice();
  }, [params.id]);

  if (loading) return <p className="text-muted-foreground">불러오는 중...</p>;
  if (!notice) return <p className="text-destructive">공지를 찾을 수 없습니다.</p>;

  return (
    <article className="max-w-4xl">
      {/* 제목 */}
      <h1 className="text-2xl font-bold">{notice.title}</h1>

      <Separator className="my-4" />

      {/* 메타 정보 */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>날짜</span>
          <span className="text-foreground">
            {new Date(notice.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
        <Badge variant={notice.is_published ? "default" : "secondary"}>
          {notice.is_published ? "공개" : "비공개"}
        </Badge>
      </div>

      <Separator className="my-4" />

      {/* 본문 */}
      <div className="prose max-w-none py-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {notice.content}
        </ReactMarkdown>
      </div>

      {notice.attachment_url && notice.attachment_filename && (
        <>
          <Separator className="my-4" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">첨부파일</span>
            <a
              href={notice.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {notice.attachment_filename}
            </a>
          </div>
        </>
      )}

      <Separator className="my-6" />

      {/* 하단 버튼 */}
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/admin/notices/${notice.id}/edit`}>수정</Link>
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/notices")}>
          목록
        </Button>
      </div>
    </article>
  );
}

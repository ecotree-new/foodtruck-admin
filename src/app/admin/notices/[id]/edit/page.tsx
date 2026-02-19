"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NoticeForm from "@/components/notices/notice-form";

export default function EditNoticePage() {
  const params = useParams();
  const [notice, setNotice] = useState<{
    id: string;
    title: string;
    content: string;
    is_published: boolean;
    attachment_url?: string | null;
    attachment_filename?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotice() {
      try {
        const res = await fetch(`/api/admin/notices/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setNotice(data);
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
    <div>
      <h2 className="text-2xl font-bold mb-4">공지 수정</h2>
      <NoticeForm initialData={notice} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EventForm from "@/components/events/event-form";

export default function EditEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<{
    id: string;
    title: string;
    content: string;
    cover_image_url: string | null;
    is_published: boolean;
    attachment_url?: string | null;
    attachment_filename?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/admin/events/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch {
        console.error("Failed to fetch event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  if (loading) return <p className="text-muted-foreground">불러오는 중...</p>;
  if (!event) return <p className="text-destructive">행사를 찾을 수 없습니다.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">행사 수정</h2>
      <EventForm initialData={event} />
    </div>
  );
}

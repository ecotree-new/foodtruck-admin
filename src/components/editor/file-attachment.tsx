"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";

interface FileAttachmentProps {
  currentUrl?: string | null;
  currentFilename?: string | null;
  onUploadComplete: (url: string, filename: string) => void;
  onRemove: () => void;
}

export default function FileAttachment({
  currentUrl,
  currentFilename,
  onUploadComplete,
  onRemove,
}: FileAttachmentProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedInSession, setUploadedInSession] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const presignRes = await fetch("/api/admin/attachments/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!presignRes.ok) throw new Error("presigned URL 발급 실패");

      const { signedUrl, fileUrl, originalFilename } = await presignRes.json();
      setProgress(30);

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("파일 업로드 실패");

      setProgress(100);
      setUploadedInSession(true);
      onUploadComplete(fileUrl, originalFilename);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (currentUrl && currentFilename) {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{currentFilename}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto h-6 w-6"
          onClick={async () => {
            if (uploadedInSession && currentUrl) {
              fetch("/api/admin/attachments/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: currentUrl }),
              }).catch(() => {});
              setUploadedInSession(false);
            }
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Paperclip className="mr-2 h-4 w-4" />
        {uploading ? `업로드 중... ${progress}%` : "파일 첨부"}
      </Button>
    </div>
  );
}

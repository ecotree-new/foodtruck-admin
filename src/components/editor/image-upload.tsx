"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onUploadComplete: (url: string, imageId: string) => void;
  eventId?: string;
}

export default function ImageUpload({ onUploadComplete, eventId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setProgress(0);

    try {
      // 1. Get presigned URL
      const presignRes = await fetch("/api/admin/images/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          eventId,
        }),
      });

      if (!presignRes.ok) throw new Error("presigned URL 발급 실패");

      const { signedUrl, fileUrl, imageId } = await presignRes.json();
      setProgress(30);

      // 2. Upload to R2
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("이미지 업로드 실패");

      setProgress(100);
      onUploadComplete(fileUrl, imageId);
    } catch (err) {
      console.error("Upload failed:", err);
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? `업로드 중... ${progress}%` : "이미지 업로드"}
      </Button>
      {preview && (
        <img
          src={preview}
          alt="미리보기"
          className="max-w-xs rounded border"
        />
      )}
    </div>
  );
}

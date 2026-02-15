"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { Block } from "@blocknote/core";

interface EventEditorProps {
  initialContent?: Block[];
  onChange: (content: Block[]) => void;
}

export default function EventEditor({ initialContent, onChange }: EventEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
    uploadFile: async (file: File) => {
      // Get presigned URL
      const presignRes = await fetch("/api/admin/images/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!presignRes.ok) throw new Error("presigned URL 발급 실패");

      const { signedUrl, fileUrl } = await presignRes.json();

      // Upload to R2
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("이미지 업로드 실패");

      return fileUrl;
    },
  });

  return (
    <div className="border rounded-md min-h-[400px]">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          onChange(editor.document);
        }}
        theme="light"
      />
    </div>
  );
}

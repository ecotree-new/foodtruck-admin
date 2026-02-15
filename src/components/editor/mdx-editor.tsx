"use client";

import {
  MDXEditor as Editor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertThematicBreak,
  UndoRedo,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { forwardRef } from "react";

interface MdxEditorProps {
  markdown: string;
  onChange: (value: string) => void;
  placeholder?: string;
  enableImageUpload?: boolean;
}

async function imageUploadHandler(image: File): Promise<string> {
  const presignRes = await fetch("/api/admin/images/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: image.name,
      contentType: image.type,
    }),
  });

  if (!presignRes.ok) throw new Error("presigned URL 발급 실패");

  const { signedUrl, fileUrl } = await presignRes.json();

  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": image.type },
    body: image,
  });

  if (!uploadRes.ok) throw new Error("이미지 업로드 실패");

  return fileUrl;
}

const MdxEditor = forwardRef<MDXEditorMethods, MdxEditorProps>(
  ({ markdown, onChange, placeholder, enableImageUpload = false }, ref) => {
    const plugins = [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <UndoRedo />
            <Separator />
            <BlockTypeSelect />
            <Separator />
            <BoldItalicUnderlineToggles />
            <Separator />
            <ListsToggle options={["bullet", "number"]} />
            <Separator />
            <CreateLink />
            {enableImageUpload && <InsertImage />}
            <InsertThematicBreak />
          </>
        ),
      }),
    ];

    if (enableImageUpload) {
      plugins.push(
        imagePlugin({ imageUploadHandler })
      );
    }

    return (
      <div className="border rounded-md [&_.mdxeditor]:min-h-[300px]">
        <Editor
          ref={ref}
          markdown={markdown}
          onChange={onChange}
          placeholder={placeholder}
          plugins={plugins}
          contentEditableClassName="prose max-w-none px-4 py-3"
        />
      </div>
    );
  }
);

MdxEditor.displayName = "MdxEditor";

export default MdxEditor;

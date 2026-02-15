"use client";

import React from "react";
import { Block } from "@blocknote/core";

interface BlocksRendererProps {
  blocks: Block[];
}

type InlineItem = {
  type: string;
  text?: string;
  href?: string;
  styles?: Record<string, boolean>;
  content?: { type: string; text?: string }[];
};

function renderInlineContent(content: InlineItem[]) {
  return content.map((item, i) => {
    if (item.type === "text") {
      let element: React.ReactNode = item.text;
      if (item.styles?.bold) element = <strong key={i}>{element}</strong>;
      if (item.styles?.italic) element = <em key={i}>{element}</em>;
      if (item.styles?.underline) element = <u key={i}>{element}</u>;
      if (item.styles?.strikethrough) element = <s key={i}>{element}</s>;
      if (item.styles?.code) element = <code key={i} className="bg-muted px-1 rounded">{element}</code>;
      return <span key={i}>{element}</span>;
    }
    if (item.type === "link") {
      return (
        <a key={i} href={item.href} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          {item.content?.map((c, j) => <span key={j}>{c.text}</span>)}
        </a>
      );
    }
    return null;
  });
}

type BlockWithProps = Block & {
  props: Record<string, string>;
  content?: InlineItem[];
  children?: Block[];
};

function renderHeading(props: Record<string, string>, content: InlineItem[] | undefined) {
  const level = props?.level || "1";
  const headingClass = level === "1" ? "text-2xl font-bold mb-3" : level === "2" ? "text-xl font-bold mb-2" : "text-lg font-bold mb-2";
  const inner = content ? renderInlineContent(content) : null;

  if (level === "2") return <h2 className={headingClass}>{inner}</h2>;
  if (level === "3") return <h3 className={headingClass}>{inner}</h3>;
  return <h1 className={headingClass}>{inner}</h1>;
}

function RenderBlock({ block }: { block: Block }) {
  const { type, props, content } = block as BlockWithProps;

  switch (type) {
    case "paragraph":
      return (
        <p className="mb-2">
          {content && renderInlineContent(content)}
        </p>
      );
    case "heading":
      return renderHeading(props, content);
    case "bulletListItem":
      return (
        <li className="list-disc ml-4 mb-1">
          {content && renderInlineContent(content)}
        </li>
      );
    case "numberedListItem":
      return (
        <li className="list-decimal ml-4 mb-1">
          {content && renderInlineContent(content)}
        </li>
      );
    case "image":
      return (
        <figure className="my-4">
          <img
            src={props?.url}
            alt={props?.caption || ""}
            className="max-w-full rounded"
          />
          {props?.caption && (
            <figcaption className="text-sm text-muted-foreground mt-1">
              {props.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      if (content) {
        return <p className="mb-2">{renderInlineContent(content)}</p>;
      }
      return null;
  }
}

export default function BlocksRenderer({ blocks }: BlocksRendererProps) {
  return (
    <div className="prose max-w-none">
      {blocks.map((block, i) => (
        <RenderBlock key={block.id || i} block={block} />
      ))}
    </div>
  );
}

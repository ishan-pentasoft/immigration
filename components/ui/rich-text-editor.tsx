"use client";

import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
  ["link", "image", "video"],
  ["clean"],
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your content...",
  disabled = false,
}: RichTextEditorProps) {
  const quillRef = useRef<Quill | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      editorRef.current &&
      !quillRef.current
    ) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
        placeholder,
      });

      quillRef.current = quill;

      quill.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
          const content = quill.root.innerHTML;
          // Prevent calling onChange with just the placeholder paragraph
          if (content === "<p><br></p>") {
            onChange("");
          } else {
            onChange(content);
          }
        }
      });
    }
  }, [placeholder, onChange]);

  // Set initial value and disabled state
  useEffect(() => {
    const quill = quillRef.current;
    if (quill) {
      if (value !== quill.root.innerHTML) {
        quill.root.innerHTML = value;
      }
      quill.enable(!disabled);
    }
  }, [value, disabled]);

  return (
    <div
      ref={editorRef}
      style={{
        minHeight: "300px",
        border: "1px solid #333",
        borderRadius: "5px",
      }}
      className="bg-muted"
    />
  );
}

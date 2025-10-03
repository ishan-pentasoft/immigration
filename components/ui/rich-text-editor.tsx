"use client";

import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Maximize, Minimize } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Handle Escape key to exit fullscreen and manage body scroll lock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
      // Focus editor when entering fullscreen for better UX
      quillRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    // Small timeout to ensure layout updated before focusing
    setTimeout(() => quillRef.current?.focus(), 0);
  };

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-background/95 backdrop-blur p-2 md:p-4"
          : "relative"
      }
    >
      <button
        type="button"
        onClick={toggleFullscreen}
        disabled={disabled}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="absolute right-5 bottom-2 z-10 rounded border px-2 py-1 cursor-pointer text-sm bg-background hover:bg-accent disabled:opacity-50"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      <div
        ref={editorRef}
        style={{
          minHeight: isFullscreen ? "calc(100vh - 56px)" : "300px",
          border: "1px solid #333",
          borderRadius: "5px",
          background: "var(--muted)",
        }}
        className={isFullscreen ? "h-[calc(100vh-56px)]" : "bg-muted"}
      />
    </div>
  );
}

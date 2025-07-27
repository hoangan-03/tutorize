import React, { useRef, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt("Nhập URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  }, [executeCommand]);

  const insertImage = useCallback(() => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url) {
      executeCommand("insertImage", url);
    }
  }, [executeCommand]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const toolbarButtons = [
    { icon: Bold, command: "bold", title: "Bold" },
    { icon: Italic, command: "italic", title: "Italic" },
    { icon: Underline, command: "underline", title: "Underline" },
    { icon: List, command: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
    { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
    { icon: AlignRight, command: "justifyRight", title: "Align Right" },
  ];

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Format Buttons */}
        {toolbarButtons.map(({ icon: Icon, command, title }) => (
          <button
            key={command}
            type="button"
            onClick={() => executeCommand(command)}
            className="p-2 hover:bg-gray-100 rounded border border-gray-200"
            title={title}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <div className="w-px bg-gray-300 mx-1" />

        {/* Font Size */}
        <select
          onChange={(e) => executeCommand("fontSize", e.target.value)}
          className="px-2 py-1 text-sm border border-gray-200 rounded"
          title="Font Size"
        >
          <option value="1">Nhỏ</option>
          <option value="3" selected>
            Bình thường
          </option>
          <option value="5">Lớn</option>
          <option value="7">Rất lớn</option>
        </select>

        {/* Heading */}
        <select
          onChange={(e) => executeCommand("formatBlock", e.target.value)}
          className="px-2 py-1 text-sm border border-gray-200 rounded"
          title="Heading"
        >
          <option value="div">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Link and Image */}
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-gray-100 rounded border border-gray-200"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={insertImage}
          className="p-2 hover:bg-gray-100 rounded border border-gray-200"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-8 min-h-[300px] focus:outline-none editor-placeholder"
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style>{`
        .editor-placeholder:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

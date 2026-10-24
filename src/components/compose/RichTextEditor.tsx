
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Undo2, Redo2, Bold, Italic, Underline as UnderlineIcon,
  Strikethrough, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, IndentIncrease, IndentDecrease,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-editor-content",
        "data-placeholder": "Type Your Reply...",
      },
    },
  });

  if (!editor) return null;

  const tools = [
    { label: "Undo", icon: <Undo2 size={17} />, action: () => editor.chain().focus().undo().run() },
    { label: "Redo", icon: <Redo2 size={17} />, action: () => editor.chain().focus().redo().run() },
    { label: "Text style", icon: <span className="style-icon">Tт</span>, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading") },
    { label: "Bold", icon: <Bold size={17} />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { label: "Italic", icon: <Italic size={17} />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { label: "Underline", icon: <UnderlineIcon size={17} />, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
    { label: "Align left", icon: <AlignLeft size={17} />, action: () => editor.chain().focus().setTextAlign("left").run() },
    { label: "Align center", icon: <AlignCenter size={17} />, action: () => editor.chain().focus().setTextAlign("center").run() },
    { label: "Align right", icon: <AlignRight size={17} />, action: () => editor.chain().focus().setTextAlign("right").run() },
    { label: "Numbered list", icon: <ListOrdered size={17} />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { label: "Bulleted list", icon: <List size={17} />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { label: "Indent list", icon: <IndentIncrease size={17} />, action: () => editor.chain().focus().sinkListItem("listItem").run() },
    { label: "Outdent list", icon: <IndentDecrease size={17} />, action: () => editor.chain().focus().liftListItem("listItem").run() },
    { label: "Quote", icon: <Quote size={17} />, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { label: "Strikethrough", icon: <Strikethrough size={17} />, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") },
  ];

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            className={`rich-tool ${tool.active ? "active" : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={tool.action}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

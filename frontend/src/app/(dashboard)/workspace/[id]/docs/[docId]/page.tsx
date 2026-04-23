"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { documentApi, aiApi } from "@/lib/api";
import { useSocket } from "@/providers/socket-provider";
import { useAuth } from "@/providers/auth-provider";
import { Document } from "@/types";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import LinkExt from "@tiptap/extension-link";
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Minus, Undo, Redo,
  Sparkles, Loader2, CheckSquare, Link as LinkIcon, Save
} from "lucide-react";
import { toast } from "sonner";

export default function DocEditorPage() {
  const { id: workspaceId, docId } = useParams<{ id: string; docId: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [doc, setDoc] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing... Press / for AI commands' }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      LinkExt.configure({ openOnClick: false }),
    ],
    content: '',
    editorProps: {
      attributes: { class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px]' },
      handleKeyDown: (_view, event) => {
        if (event.key === '/' && !event.shiftKey) {
          setTimeout(() => setShowAiMenu(true), 100);
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (socket && docId) {
        socket.emit('document:update', { documentId: docId, content: editor.getJSON() });
      }
      debouncedSave(editor.getJSON());
    },
  });

  const saveTimer = { current: null as NodeJS.Timeout | null };
  const debouncedSave = useCallback((content: any) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        await documentApi.update(docId, { content });
      } catch { } finally { setSaving(false); }
    }, 2000);
  }, [docId]);

  useEffect(() => {
    if (docId) loadDoc();
  }, [docId]);

  useEffect(() => {
    if (socket && docId) {
      socket.emit('document:join', { documentId: docId });
      socket.on('document:updated', ({ content, userId }) => {
        if (userId !== user?.id && editor && content) {
          const { from, to } = editor.state.selection;
          editor.commands.setContent(content, { emitUpdate: false });
          try { editor.commands.setTextSelection({ from, to }); } catch { }
        }
      });
      return () => {
        socket.emit('document:leave', { documentId: docId });
        socket.off('document:updated');
      };
    }
  }, [socket, docId, editor, user]);

  const loadDoc = async () => {
    try {
      const { data } = await documentApi.get(docId);
      setDoc(data);
      setTitle(data.title);
      if (editor && data.content) editor.commands.setContent(data.content);
    } catch { toast.error("Failed to load document"); }
    finally { setIsLoading(false); }
  };

  const saveTitle = async () => {
    try { await documentApi.update(docId, { title }); }
    catch { }
  };

  const handleAiAction = async (action: string) => {
    setShowAiMenu(false);
    if (!editor) return;
    const selected = editor.state.doc.textBetween(
      editor.state.selection.from, editor.state.selection.to, ' '
    );
    const context = editor.getText().slice(0, 1000);
    const prompt = selected || context || 'Write something interesting';
    setAiLoading(true);
    try {
      const response = await aiApi.complete({ prompt, context, action });
      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let aiText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              aiText += parsed.content;
              editor.commands.insertContent(parsed.content);
            }
          } catch { }
        }
      }
    } catch { toast.error("AI request failed. Check your API key."); }
    finally { setAiLoading(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const ToolBtn = ({ onClick, active, children, title: t }: any) => (
    <button onClick={onClick} title={t}
      className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
      {children}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      {/* Title */}
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle}
        className="w-full text-3xl font-bold bg-transparent outline-none mb-2 placeholder:text-muted-foreground/50" placeholder="Untitled" />
      <div className="flex items-center gap-3 mb-6 text-xs text-muted-foreground">
        {saving ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Saving...</span> : <span className="flex items-center gap-1"><Save className="w-3 h-3" />Saved</span>}
        {doc?.author && <span>by {doc.author.name}</span>}
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="glass-card px-2 py-1.5 mb-4 flex items-center gap-0.5 flex-wrap sticky top-0 z-10">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><Strikethrough className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code"><Code className="w-4 h-4" /></ToolBtn>
          <div className="w-px h-5 bg-border mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 className="w-4 h-4" /></ToolBtn>
          <div className="w-px h-5 bg-border mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task List"><CheckSquare className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="w-4 h-4" /></ToolBtn>
          <div className="w-px h-5 bg-border mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolBtn>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => setShowAiMenu(!showAiMenu)} disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-medium hover:opacity-90 disabled:opacity-50">
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} AI
            </button>
            {showAiMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAiMenu(false)} />
                <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-xl shadow-xl p-1.5 z-50 animate-scale-in">
                  {[
                    { action: 'continue', label: '✍️ Continue writing' },
                    { action: 'improve', label: '✨ Improve text' },
                    { action: 'summarize', label: '📝 Summarize' },
                    { action: 'fix_grammar', label: '🔤 Fix grammar' },
                    { action: 'explain', label: '💡 Explain' },
                    { action: 'generate_code', label: '💻 Generate code' },
                  ].map(({ action, label }) => (
                    <button key={action} onClick={() => handleAiAction(action)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors">{label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="glass-card p-6 min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

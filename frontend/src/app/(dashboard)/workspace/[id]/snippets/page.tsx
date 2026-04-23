"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { snippetApi } from "@/lib/api";
import { Snippet } from "@/types";
import { formatRelativeTime, getInitials, generateColor } from "@/lib/utils";
import { Code2, Plus, Loader2, Search, Copy, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = ['javascript','typescript','python','java','go','rust','c','cpp','csharp','html','css','sql','bash','json','yaml','markdown','ruby','php','swift','kotlin'];

export default function SnippetsPage() {
  const { id } = useParams<{ id: string }>();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', language: 'javascript', description: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { if (id) loadSnippets(); }, [id]);

  const loadSnippets = async () => {
    try { const { data } = await snippetApi.list(id); setSnippets(data); }
    catch { toast.error("Failed to load snippets"); }
    finally { setIsLoading(false); }
  };

  const createSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await snippetApi.create(id, form);
      setShowCreate(false); setForm({ title: '', code: '', language: 'javascript', description: '' });
      loadSnippets(); toast.success("Snippet created");
    } catch { toast.error("Failed to create snippet"); }
  };

  const deleteSnippet = async (snippetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await snippetApi.delete(snippetId); loadSnippets(); toast.success("Deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const copyCode = (code: string, snippetId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(snippetId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  };

  const filtered = snippets.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.language.toLowerCase().includes(search.toLowerCase())
  );

  const langColors: Record<string, string> = {
    javascript: 'text-yellow-400 bg-yellow-400/10', typescript: 'text-blue-400 bg-blue-400/10',
    python: 'text-green-400 bg-green-400/10', java: 'text-orange-400 bg-orange-400/10',
    go: 'text-cyan-400 bg-cyan-400/10', rust: 'text-orange-500 bg-orange-500/10',
    html: 'text-red-400 bg-red-400/10', css: 'text-purple-400 bg-purple-400/10',
    sql: 'text-blue-300 bg-blue-300/10', bash: 'text-green-300 bg-green-300/10',
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold">Code Snippets</h1><p className="text-sm text-muted-foreground">{snippets.length} snippets</p></div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> New Snippet
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or language..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:border-primary outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No snippets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Save your frequently used code snippets</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium"><Plus className="w-4 h-4" /> Add Snippet</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((snippet) => (
            <div key={snippet.id} className="glass-card overflow-hidden group hover:border-primary/20 transition-all">
              <div className="p-4 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{snippet.title}</h3>
                  {snippet.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{snippet.description}</p>}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${langColors[snippet.language] || 'text-muted-foreground bg-muted'}`}>{snippet.language}</span>
                  <button onClick={() => copyCode(snippet.code, snippet.id)} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                    {copiedId === snippet.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={(e) => deleteSnippet(snippet.id, e)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="px-4 pb-4">
                <pre className="bg-muted/50 rounded-lg p-3 overflow-x-auto text-xs font-mono leading-relaxed max-h-40"><code>{snippet.code}</code></pre>
              </div>
              <div className="px-4 py-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white" style={{ backgroundColor: generateColor(snippet.author?.name || '') }}>
                  {getInitials(snippet.author?.name || '?')}
                </div>
                <span>{snippet.author?.name}</span>
                <span>•</span>
                <span>{formatRelativeTime(snippet.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Snippet</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={createSnippet} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm outline-none focus:border-primary" placeholder="API helper function" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Language</label>
                <select value={form.language} onChange={(e) => setForm(p => ({ ...p, language: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm outline-none">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Code</label>
                <textarea value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm font-mono resize-none outline-none focus:border-primary" rows={8} placeholder="Paste your code here..." required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description <span className="text-muted-foreground">(optional)</span></label>
                <input type="text" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm outline-none" placeholder="What does this code do?" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm hover:bg-muted/50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90">Save Snippet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { documentApi } from "@/lib/api";
import { Document } from "@/types";
import { formatRelativeTime, getInitials, generateColor } from "@/lib/utils";
import { FileText, Plus, Loader2, ChevronRight, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DocsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { if (id) loadDocs(); }, [id]);

  const loadDocs = async () => {
    try { const { data } = await documentApi.list(id); setDocs(data); }
    catch { toast.error("Failed to load documents"); }
    finally { setIsLoading(false); }
  };

  const createDoc = async () => {
    try {
      const { data } = await documentApi.create(id);
      router.push(`/workspace/${id}/docs/${data.id}`);
    } catch { toast.error("Failed to create document"); }
  };

  const deleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await documentApi.delete(docId); loadDocs(); toast.success("Document archived"); }
    catch { toast.error("Failed to delete"); }
  };

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground">{docs.length} documents</p>
        </div>
        <button onClick={createDoc} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> New Document
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:border-primary outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">{search ? 'No documents found' : 'No documents yet'}</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first document to get started</p>
          <button onClick={createDoc} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Create Document
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div key={doc.id} onClick={() => router.push(`/workspace/${id}/docs/${doc.id}`)}
              className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-primary/20 transition-all group">
              <span className="text-2xl">{doc.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium group-hover:text-primary transition-colors">{doc.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white" style={{ backgroundColor: generateColor(doc.author?.name || '') }}>
                      {getInitials(doc.author?.name || '?')}
                    </div>
                    {doc.author?.name}
                  </span>
                  <span>{formatRelativeTime(doc.updatedAt)}</span>
                  {doc.children && doc.children.length > 0 && <span>{doc.children.length} sub-pages</span>}
                </div>
              </div>
              <button onClick={(e) => deleteDoc(doc.id, e)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { workspaceApi } from "@/lib/api";
import { Workspace, Activity } from "@/types";
import { formatRelativeTime, getInitials, generateColor } from "@/lib/utils";
import { useSocket } from "@/providers/socket-provider";
import { useAuth } from "@/providers/auth-provider";
import { FileText, Kanban, Code2, Users, ArrowRight, Loader2, UserPlus, Clock } from "lucide-react";
import { toast } from "sonner";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EDITOR');

  useEffect(() => { if (id) loadWorkspace(); }, [id]);

  useEffect(() => {
    if (socket && workspace && user) {
      socket.emit('workspace:join', { workspaceId: workspace.id, userName: user.name });
      return () => { socket.emit('workspace:leave', { workspaceId: workspace.id }); };
    }
  }, [socket, workspace, user]);

  const loadWorkspace = async () => {
    try { const { data } = await workspaceApi.get(id); setWorkspace(data); }
    catch { toast.error("Failed to load workspace"); }
    finally { setIsLoading(false); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await workspaceApi.invite(id, { email: inviteEmail, role: inviteRole });
      toast.success("Invitation sent");
      setShowInvite(false); setInviteEmail(''); loadWorkspace();
    } catch (err: any) { toast.error(err.response?.data?.error || "Failed to invite"); }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (!workspace) return <div className="p-6 text-center text-sm text-muted-foreground">Workspace not found</div>;

  const roleColors: Record<string, string> = {
    OWNER: 'text-warning bg-warning/10', EDITOR: 'text-primary bg-primary/10', VIEWER: 'text-muted-foreground bg-muted',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{workspace.icon}</span>
          <div>
            <h1 className="text-lg font-semibold">{workspace.name}</h1>
            {workspace.description && <p className="text-xs text-muted-foreground mt-0.5">{workspace.description}</p>}
          </div>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md gradient-primary text-white text-xs font-medium hover:opacity-90">
          <UserPlus className="w-3.5 h-3.5" /> Invite
        </button>
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {[
          { href: `/workspace/${id}/docs`, icon: FileText, label: 'Documents', count: workspace._count?.documents || 0, color: 'text-primary' },
          { href: `/workspace/${id}/kanban`, icon: Kanban, label: 'Board', count: workspace._count?.boards || 0, color: 'text-warning' },
          { href: `/workspace/${id}/snippets`, icon: Code2, label: 'Snippets', count: workspace._count?.snippets || 0, color: 'text-success' },
        ].map((item, i) => (
          <Link key={i} href={item.href} className="surface p-4 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-medium">{item.label}</h3>
            <p className="text-xs text-muted-foreground">{item.count} items</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Members */}
        <div className="surface p-4">
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" /> Members ({workspace.members?.length || 0})
          </h3>
          <div className="space-y-2.5">
            {workspace.members?.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium text-white"
                  style={{ backgroundColor: generateColor(m.user.email || '') }}>
                  {getInitials(m.user.name || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{m.user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.user.email}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleColors[m.role]}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="surface p-4 lg:col-span-2">
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" /> Recent Activity
          </h3>
          {workspace.activities && workspace.activities.length > 0 ? (
            <div className="space-y-2">
              {workspace.activities.map((a: Activity) => (
                <div key={a.id} className="flex items-start gap-2.5 py-1.5 border-b border-border last:border-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: generateColor(a.user?.name || '') }}>
                    {getInitials(a.user?.name || '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs"><span className="font-medium">{a.user?.name}</span> <span className="text-muted-foreground">{a.message}</span></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No activity yet</p>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowInvite(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-5 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-semibold mb-4">Invite member</h2>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Email</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border focus:border-primary outline-none text-sm" placeholder="teammate@company.com" required autoFocus />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-border outline-none text-sm">
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-2 rounded-md border border-border text-xs hover:bg-muted/50">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-md gradient-primary text-white text-xs font-medium hover:opacity-90">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

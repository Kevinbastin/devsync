"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSocket } from "@/providers/socket-provider";
import {
  Zap, LayoutDashboard, FileText, Kanban, Code2, Settings,
  ChevronLeft, ChevronRight, Plus, Search, Bell, Moon, Sun,
  LogOut, User, Loader2, Menu
} from "lucide-react";
import { useTheme } from "next-themes";
import { getInitials, generateColor } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const workspaceMatch = pathname.match(/\/workspace\/([^\/]+)/);
  const workspaceId = workspaceMatch ? workspaceMatch[1] : null;

  const navItems = workspaceId
    ? [
        { href: `/workspace/${workspaceId}`, icon: LayoutDashboard, label: 'Overview' },
        { href: `/workspace/${workspaceId}/docs`, icon: FileText, label: 'Documents' },
        { href: `/workspace/${workspaceId}/kanban`, icon: Kanban, label: 'Board' },
        { href: `/workspace/${workspaceId}/snippets`, icon: Code2, label: 'Snippets' },
        { href: `/workspace/${workspaceId}/settings`, icon: Settings, label: 'Settings' },
      ]
    : [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} border-r border-border flex flex-col transition-all duration-200 relative group`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-3 border-b border-border">
          <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="text-sm font-semibold tracking-tight">DevSync</span>}
        </div>

        {/* Collapse */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-[4.5rem] w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted z-10">
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors ${
                  isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-card'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}

          {!workspaceId && sidebarOpen && (
            <Link href="/dashboard"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground border border-dashed border-border mt-3 hover:bg-card transition-colors">
              <Plus className="w-4 h-4" /> New Workspace
            </Link>
          )}
        </nav>

        {/* Online */}
        {sidebarOpen && onlineUsers.length > 0 && (
          <div className="p-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {onlineUsers.length} online
            </p>
            <div className="flex -space-x-1.5">
              {onlineUsers.slice(0, 4).map((u: any, i: number) => (
                <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium text-white border border-background"
                  style={{ backgroundColor: generateColor(u.name || u.id) }} title={u.name}>
                  {getInitials(u.name || '?')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="p-2 border-t border-border">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] ${isConnected ? 'text-success' : 'text-muted-foreground'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success' : 'bg-muted-foreground'}`} />
            {sidebarOpen && (isConnected ? 'Connected' : 'Offline')}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu className="w-4 h-4" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search..."
                className="w-52 pl-8 pr-3 py-1.5 rounded-md bg-card border border-border text-xs focus:border-primary outline-none transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-card transition-colors text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>

            {/* User */}
            <div className="relative ml-1">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-card transition-colors">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium text-white"
                  style={{ backgroundColor: generateColor(user?.email || '') }}>
                  {getInitials(user?.name || 'U')}
                </div>
                {user?.name && <span className="text-xs font-medium hidden md:block">{user.name}</span>}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-lg shadow-lg p-1 z-50 animate-scale-in">
                    <div className="px-2.5 py-2 border-b border-border mb-1">
                      <p className="text-xs font-medium">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                    </div>
                    <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs hover:bg-muted/50 text-muted-foreground">
                      <User className="w-3.5 h-3.5" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs hover:bg-muted/50 text-muted-foreground">
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <div className="border-t border-border mt-1 pt-1">
                      <button onClick={logout}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs hover:bg-destructive/10 text-destructive">
                        <LogOut className="w-3.5 h-3.5" /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

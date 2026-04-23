"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import {
  FileText, Kanban, Code2, Sparkles, Users, Zap,
  ArrowRight, Shield, Layers
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight">DevSync</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-3.5 py-1.5 rounded-md gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="px-3.5 py-1.5 rounded-md gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Now in public beta
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Your team&apos;s
            <br />
            <span className="gradient-text">dev workspace.</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            Docs, task boards, code snippets, and AI — in one place.
            Built for small teams that ship fast.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group px-5 py-2.5 rounded-md gradient-primary text-white font-medium text-sm hover:opacity-90 transition-all flex items-center gap-2"
            >
              Start building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-5 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-card transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-4xl mx-auto mt-14 animate-slide-up">
          <div className="surface overflow-hidden shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-0.5 rounded bg-muted text-[11px] text-muted-foreground font-mono">
                  devsync.app/dashboard
                </div>
              </div>
            </div>
            <div className="flex h-72 md:h-80">
              <div className="w-48 border-r border-border p-3 hidden md:block bg-card/50">
                <div className="flex items-center gap-2 mb-5 px-1">
                  <div className="w-5 h-5 rounded gradient-primary" />
                  <span className="text-xs font-semibold">DevSync</span>
                </div>
                {['Dashboard', 'Documents', 'Board', 'Snippets'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs mb-0.5 ${i === 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}>
                    {(() => { const Icon = [Layers, FileText, Kanban, Code2][i]; return <Icon className="w-3.5 h-3.5" />; })()}
                    {item}
                  </div>
                ))}
                <div className="pt-4 border-t border-border mt-6">
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[10px] text-muted-foreground">3 online</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-5 bg-background">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold">Good evening, Kevin</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">3 workspaces · 12 active tasks</p>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {[
                    { label: 'Documents', value: '24', color: 'text-primary' },
                    { label: 'Tasks', value: '12', color: 'text-warning' },
                    { label: 'Members', value: '5', color: 'text-success' },
                  ].map((s, i) => (
                    <div key={i} className="surface p-3">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="surface p-3">
                  <h4 className="text-xs font-semibold mb-2.5">Recent</h4>
                  {['Updated "API v2 Design Doc"', 'Moved task → Done', 'New snippet: fetchWithRetry'].map((a, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground border-b border-border last:border-0">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <span className="flex-1">{a}</span>
                      <span className="text-[10px]">{['2m', '18m', '1h'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Everything your team needs</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Stop context-switching between five different apps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <FileText className="w-5 h-5" />, title: "Documents", desc: "Rich text editor with real-time collaboration, nested pages, and slash commands." },
              { icon: <Kanban className="w-5 h-5" />, title: "Kanban Board", desc: "Drag-and-drop task management with priorities, due dates, and assignees." },
              { icon: <Code2 className="w-5 h-5" />, title: "Code Snippets", desc: "Save and share code with syntax highlighting across 50+ languages." },
              { icon: <Sparkles className="w-5 h-5" />, title: "AI Assistant", desc: "Generate, improve, or summarize content inline while you write." },
              { icon: <Users className="w-5 h-5" />, title: "Live Collaboration", desc: "See who's online, track live cursors, and get instant updates." },
              { icon: <Shield className="w-5 h-5" />, title: "Access Control", desc: "Owner, Editor, and Viewer roles with secure authentication." },
            ].map((f, i) => (
              <div key={i} className="surface p-5 hover:border-primary/30 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Get started in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Create a workspace", desc: "Sign up and create your first workspace in seconds." },
              { step: "02", title: "Invite your team", desc: "Add members by email and assign roles." },
              { step: "03", title: "Start shipping", desc: "Write docs, manage tasks, and collaborate in real-time." },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary/20 mb-2">{s.step}</div>
                <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="surface p-10">
            <h2 className="text-2xl font-bold mb-3">Ready to try it?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create a workspace in seconds. Free to use.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md gradient-primary text-white font-medium text-sm hover:opacity-90 transition-all"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded gradient-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">DevSync</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DevSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

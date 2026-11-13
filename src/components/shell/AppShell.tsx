"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import { authClient } from "@/lib/auth-client";

type NavKey =
  | "dashboard"
  | "projects"
  | "chat"
  | "contracts"
  | "invoices"
  | "tickets"
  | "settings"
  | "users"
  | "portfolio";

interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const CLIENT_NAV: NavItem[] = [
  { key: "dashboard", label: "Accueil", href: "/dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Mon projet", href: "/dashboard/projects", icon: FolderOpen },
  { key: "invoices", label: "Paiements", href: "/dashboard/invoices", icon: Receipt },
];

const ADMIN_NAV: NavItem[] = [
  { key: "dashboard", label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { key: "users", label: "Clients", href: "/admin/users", icon: Users },
  { key: "projects", label: "Projets", href: "/admin/projects", icon: FolderOpen },
  { key: "tickets", label: "Assistance", href: "/admin/tickets", icon: LifeBuoy },
  { key: "invoices", label: "Facturation", href: "/admin/invoices", icon: Receipt },
  { key: "portfolio", label: "Vitrine", href: "/admin/portfolio", icon: Briefcase },
  { key: "chat", label: "Messagerie", href: "/admin/chat", icon: MessageSquare },
];

const MOBILE_CLIENT: NavKey[] = ["dashboard", "projects", "invoices"];
const MOBILE_ADMIN: NavKey[] = ["dashboard", "projects", "users", "invoices", "tickets"];

interface AppShellProps {
  user: { name: string | null; email: string; role: string };
  variant: "client" | "admin";
  children: React.ReactNode;
}

function initials(name: string | null, email: string) {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default function AppShell({ user, variant, children }: AppShellProps) {
  const pathname = usePathname();
  const items = variant === "admin" ? ADMIN_NAV : CLIENT_NAV;
  const mobileKeys = variant === "admin" ? MOBILE_ADMIN : MOBILE_CLIENT;
  const mobileItems = mobileKeys
    .map((key) => items.find((item) => item.key === key))
    .filter((item): item is NavItem => Boolean(item));

  const isActive = (item: NavItem) => {
    if (item.href === "/dashboard" || item.href === "/admin") return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  // Sur une fiche projet, la navigation contextuelle reste sur le projet.
  const projectMatch = pathname.match(/\/(dashboard|admin)\/projects\/([^/]+)/);
  const projectId = projectMatch?.[2] ?? null;
  const hrefFor = (item: NavItem) => {
    if (!projectId) return item.href;
    if (item.key === "projects") return `/${variant === "admin" ? "admin" : "dashboard"}/projects/${projectId}`;
    if (item.key === "chat") return `/${variant === "admin" ? "admin" : "dashboard"}/projects/${projectId}/chat`;
    if (item.key === "contracts" && variant === "client")
      return `/dashboard/projects/${projectId}/contracts`;
    return item.href;
  };

  const activeItem = items.find((item) => isActive(item));

  const logout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[10px] focus:bg-primary focus:px-4 focus:py-2 focus:text-background"
      >
        Aller au contenu
      </a>

      {/* Barre latérale bureau */}
      <aside className="fixed left-0 top-0 z-40 hidden h-[100dvh] w-[248px] flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo href={variant === "admin" ? "/admin" : "/dashboard"} />
        </div>

        <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
            {variant === "admin" ? "Pilotage" : "Mon espace"}
          </p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <li key={item.key}>
                  <Link
                    href={hrefFor(item)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-colors ${
                      active
                        ? "bg-primary/[0.06] font-semibold text-foreground"
                        : "text-secondary hover:bg-primary/[0.04] hover:text-foreground"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      className={active ? "text-accent" : "text-muted"}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-background">
              {initials(user.name, user.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-foreground">
                {user.name || user.email}
              </p>
              <p className="truncate text-[11px] text-muted">
                {user.role === "ADMIN" ? "Administration" : "Espace client"}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Se déconnecter"
              className="rounded-[8px] p-2 text-muted transition-colors hover:bg-primary/[0.06] hover:text-foreground"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:h-16 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="lg:hidden">
              <Logo href={variant === "admin" ? "/admin" : "/dashboard"} compact />
            </span>
            <h1 className="truncate text-[15px] font-semibold text-foreground">
              {activeItem?.label ?? (variant === "admin" ? "Administration" : "Mon espace")}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {variant === "client" && (
              <Link
                href="/dashboard/tickets"
                aria-label="Aide et support"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-muted hover:bg-primary/[0.06] hover:text-foreground transition-colors"
              >
                <LifeBuoy size={18} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            )}
            {variant === "client" && (
              <Link
                href="/dashboard/settings"
                aria-label="Paramètres du profil"
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-muted hover:bg-primary/[0.06] hover:text-foreground transition-colors"
              >
                <Settings size={18} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            )}
            <NotificationCenter />
          </div>
        </header>

        <main id="contenu" className="mx-auto w-full max-w-[1180px] px-4 py-6 pb-28 md:px-8 md:py-9 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Barre inférieure mobile */}
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-3">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.key}>
                <Link
                  href={hrefFor(item)}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2 : 1.6} aria-hidden="true" />
                  <span className="max-w-full truncate px-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

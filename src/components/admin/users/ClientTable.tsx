"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { User, Project } from "@prisma/client";
import { formatDate } from "@/lib/format";

export type ClientRow = User & { projects: Project[] };

export default function ClientTable({ users }: { users: ClientRow[] }) {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.phone, user.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un nom, un e-mail, une société…"
            className="field h-10 pl-9 text-[13px]"
            aria-label="Rechercher un client"
          />
        </div>
        <p className="text-[12px] text-muted">
          {rows.length} compte{rows.length > 1 ? "s" : ""} affiché{rows.length > 1 ? "s" : ""}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="surface px-5 py-10 text-center text-[14px] text-secondary">
          Aucun client ne correspond à cette recherche.
        </p>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="label px-4 py-3 font-semibold">Client</th>
                  <th className="label px-4 py-3 font-semibold">Contact</th>
                  <th className="label px-4 py-3 font-semibold">Rôle</th>
                  <th className="label px-4 py-3 text-right font-semibold">Projets</th>
                  <th className="label px-4 py-3 font-semibold">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((user) => {
                  const display = user.name || user.email.split("@")[0];
                  const active = user.projects.filter((project) => project.status !== "DONE").length;
                  return (
                    <tr key={user.id} className="transition-colors hover:bg-card-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background text-[11px] font-semibold uppercase">
                            {display.slice(0, 2)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium">{user.name || "Sans nom"}</p>
                            {user.companyName && <p className="truncate text-[11px] text-muted">{user.companyName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] text-secondary">{user.email}</p>
                        {user.phone && <p className="text-[11px] text-muted">{user.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-secondary">
                          {user.role === "ADMIN" ? "Équipe" : "Client"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.projects.length === 0 ? (
                          <span className="text-[12px] text-muted">Aucun</span>
                        ) : (
                          <Link
                            href="/admin/projects"
                            className="numeric text-[13px] font-medium text-accent hover:underline"
                          >
                            {active} actif{active > 1 ? "s" : ""} / {user.projects.length}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-secondary">{formatDate(user.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

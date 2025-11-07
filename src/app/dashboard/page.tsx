'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  X as CloseIcon,
} from 'lucide-react';

const API_BASE = 'https://ai-team-server.onrender.com';

/* ------------------------- Types ------------------------- */
type AgentKey =
  | 'JIM' | 'ALEX' | 'MIKE' | 'TONY' | 'LARA' | 'LEIZ' | 'VALENTINA'
  | 'DANIELE' | 'SIMONE' | 'WONDER' | 'NIKO' | 'LEO' | 'LAURA';

type AgentCardMeta = {
  key: AgentKey;
  name: string;
  initials: string;
  color: string; // tailwind gradient
  href: string;
};

type RawGroupAssignment = { id?: string; groupId?: string };

type GroupAgents = {
  groupId: string;
  name: string;
  agents: AgentKey[];
};

/* ----------------------- Agent Catalog ---------------------- */
const CATALOG: Record<AgentKey, AgentCardMeta> = {
  JIM:       { key: 'JIM',       name: 'Jim AI',       initials: 'JA', color: 'from-blue-500 to-cyan-500',     href: '/dashboard/jim-ai' },
  ALEX:      { key: 'ALEX',      name: 'Alex AI',      initials: 'AA', color: 'from-purple-500 to-pink-500',   href: '/dashboard/alex-ai' },
  MIKE:      { key: 'MIKE',      name: 'Mike AI',      initials: 'MA', color: 'from-orange-500 to-red-500',    href: '/dashboard/mike-ai' },
  TONY:      { key: 'TONY',      name: 'Tony AI',      initials: 'TA', color: 'from-green-500 to-emerald-500', href: '/dashboard/tony-ai' },
  LARA:      { key: 'LARA',      name: 'Lara AI',      initials: 'LA', color: 'from-yellow-500 to-orange-500', href: '/dashboard/lara-ai' },
  LEIZ:      { key: 'LEIZ',      name: 'Leiz AI',      initials: 'LZ', color: 'from-indigo-500 to-purple-500', href: '/dashboard/leiz-ai' },
  VALENTINA: { key: 'VALENTINA', name: 'Valentina AI', initials: 'VA', color: 'from-pink-500 to-rose-500',     href: '/dashboard/valentina-ai' },
  DANIELE:   { key: 'DANIELE',   name: 'Daniele',      initials: 'DA', color: 'from-teal-500 to-cyan-500',     href: '/dashboard/daniele-ai' },
  SIMONE:    { key: 'SIMONE',    name: 'Simone',       initials: 'SI', color: 'from-violet-500 to-purple-500', href: '/dashboard/simone-ai' },
  WONDER:    { key: 'WONDER',    name: 'Wonder',       initials: 'WO', color: 'from-amber-500 to-yellow-500',  href: '/dashboard/wonder-ai' },
  NIKO:      { key: 'NIKO',      name: 'Niko',         initials: 'NI', color: 'from-sky-500 to-blue-500',      href: '/dashboard/niko-ai' },
  LEO:       { key: 'LEO',       name: 'Leo',          initials: 'LE', color: 'from-emerald-500 to-green-500', href: '/dashboard/leo-ai' },
  LAURA:     { key: 'LAURA',     name: 'Laura',        initials: 'LU', color: 'from-rose-500 to-pink-500',     href: '/dashboard/laura-ai' },
};

/* ----------------------- Helpers ----------------------- */
const normalizeAgentKeys = (values: unknown): AgentKey[] => {
  const raw = Array.isArray(values) ? values : [];
  const valid = new Set(Object.keys(CATALOG));
  return raw
    .map((s) => String(s ?? '').toUpperCase().trim())
    .filter((s): s is AgentKey => valid.has(s));
};

const getGroupAssignmentId = (a?: RawGroupAssignment): string | undefined => {
  if (!a) return undefined;
  if (typeof a.groupId === 'string' && a.groupId) return a.groupId;
  if (typeof a.id === 'string' && a.id) return a.id;
  return undefined;
};

const safeTruncate = (id?: string) => {
  if (!id || typeof id !== 'string') return '';
  return id.length <= 8 ? id : `${id.slice(0, 8)}…`;
};

// **Robust extractor** for the various API response shapes
const extractGroupPayload = (data: any, fallbackId: string): GroupAgents => {
  const groupObj = data && typeof data.group === 'object' ? data.group : undefined;

  const gid =
    (typeof data?.groupId === 'string' && data.groupId) ||
    (typeof data?.id === 'string' && data.id) ||
    (typeof groupObj?.id === 'string' && groupObj.id) ||
    fallbackId;

  const name =
    (typeof data?.name === 'string' && data.name) ||
    (typeof groupObj?.name === 'string' && groupObj.name) ||
    (typeof groupObj?.title === 'string' && groupObj.title) ||
    `Group ${safeTruncate(gid)}`;

  // agents can be in different keys/shapes
  let agentsRaw: unknown = data?.agents;
  if (!Array.isArray(agentsRaw)) agentsRaw = data?.agentNames;
  if (!Array.isArray(agentsRaw) && Array.isArray(data?.items)) {
    agentsRaw = data.items.map((it: any) => it?.agentName).filter(Boolean);
  }

  const agents = normalizeAgentKeys(agentsRaw || []);
  return { groupId: gid, name, agents };
};

/* =========================================================
 * Page
 * =======================================================*/
export default function AITeamPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  const email = useMemo(() => {
    if (!isLoaded || !isSignedIn) return '';
    return (
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      ''
    ).trim();
  }, [isLoaded, isSignedIn, user]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedAgents, setSelectedAgents] = useState<AgentKey[]>([]);
  const [groups, setGroups] = useState<GroupAgents[]>([]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGroup, setModalGroup] = useState<GroupAgents | null>(null);

  const openGroupModal = useCallback((g: GroupAgents) => {
    setModalGroup(g);
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalGroup(null);
  }, []);

  const toggleGroupChevron = useCallback((gid: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLoading(false);
      setError('You must be signed in to view your agents.');
      return;
    }
    if (!email) {
      setLoading(false);
      setError('No email found on your profile.');
      return;
    }

    const ctrl = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        // 1) Selected agents (active & unexpired)
        let myAgents: AgentKey[] = [];
        try {
          const res = await fetch(
            `${API_BASE}/admin/selected-agents?email=${encodeURIComponent(email)}`,
            { signal: ctrl.signal, cache: 'no-store' },
          );
          if (!res.ok) throw new Error('fallback');
          myAgents = normalizeAgentKeys(await res.json());
        } catch {
          const res = await fetch(
            `${API_BASE}/users/email/${encodeURIComponent(email)}/agents`,
            { signal: ctrl.signal, cache: 'no-store' },
          );
          if (!res.ok) throw new Error(await res.text());
          myAgents = normalizeAgentKeys(await res.json());
        }
        setSelectedAgents(myAgents);

        // 2) Active group assignments
        const gaRes = await fetch(
          `${API_BASE}/admin/group-assignments?email=${encodeURIComponent(
            email,
          )}&activeOnly=true`,
          { signal: ctrl.signal, cache: 'no-store' },
        );
        if (!gaRes.ok) throw new Error((await gaRes.text()) || `HTTP ${gaRes.status}`);
        const assignmentsJson = await gaRes.json();
        const assignments: RawGroupAssignment[] = Array.isArray(assignmentsJson)
          ? assignmentsJson
          : [];

        const groupIds = assignments
          .map(getGroupAssignmentId)
          .filter((v): v is string => typeof v === 'string' && v.length > 0);

        const lookups = await Promise.all(
          groupIds.map(async (gid) => {
            try {
              const res = await fetch(`${API_BASE}/admin/groups/${gid}/agents`, {
                signal: ctrl.signal,
                cache: 'no-store',
              });
              if (!res.ok) throw new Error(`groups/${gid} failed`);
              const data: any = await res.json();
              return extractGroupPayload(data, gid);
            } catch {
              // at least show the id so the card renders
              return { groupId: gid, name: `Group ${safeTruncate(gid)}`, agents: [] };
            }
          }),
        );

        setGroups(lookups.filter(Boolean) as GroupAgents[]);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => ctrl.abort();
  }, [isLoaded, isSignedIn, email]);

  // Remove any agent that is present via any active group
  const groupUnion = useMemo(() => {
    const s = new Set<AgentKey>();
    for (const g of groups) for (const a of g.agents) s.add(a);
    return s;
  }, [groups]);

  const directOnlyAgents = useMemo(
    () => selectedAgents.filter((a) => !groupUnion.has(a)),
    [selectedAgents, groupUnion],
  );

  const agentCards = useMemo(
    () => directOnlyAgents.map((k) => CATALOG[k]).filter(Boolean),
    [directOnlyAgents],
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">AI Agent Access</h1>
          {email && (
            <p className="text-sm text-gray-500">
              Showing assignments for <span className="font-medium">{email}</span>
            </p>
          )}
        </header>

        {(!isLoaded || loading) && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* My Agents (direct-only) */}
            <section className="mt-6">
              <h2 className="mb-3 text-base font-semibold text-gray-900">My Agents</h2>
              {agentCards.length === 0 ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-600">
                  No individually-assigned agents.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {agentCards.map((agent) => (
                    <Link key={agent.key} href={agent.href}>
                      <Card className="group relative flex items-center gap-4 border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 cursor-pointer">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={`bg-gradient-to-br ${agent.color} text-white font-semibold`}>
                            {agent.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-black">{agent.name}</h3>
                        </div>
                        <span className="opacity-0 transition-opacity group-hover:opacity-100">
                          <MoreHorizontal className="h-5 w-5 text-gray-600" />
                        </span>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* My Groups */}
            <section className="mt-10">
              <h2 className="mb-3 text-base font-semibold text-gray-900">My Groups</h2>
              {groups.length === 0 ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-600">
                  No active group assignments.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {groups.map((g) => {
                    const isOpen = expanded.has(g.groupId);
                    return (
                      <Card key={g.groupId} className="border-gray-200 bg-white">
                        <div className="flex w-full items-center justify-between px-4 py-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-gray-900">
                              {g.name || `Group ${safeTruncate(g.groupId)}`}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {g.agents.length} agent{g.agents.length === 1 ? '' : 's'}
                            </p>
                          </div>

                          <div className="ml-4 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleGroupChevron(g.groupId)}
                              className="rounded-md border border-gray-200 p-1 hover:bg-gray-50"
                              aria-label="Toggle details"
                            >
                              {isOpen ? (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openGroupModal(g)}
                              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Open
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="px-4 pb-4">
                            {g.agents.length > 0 ? (
                              <ul className="flex flex-wrap gap-2">
                                {g.agents.map((a) => (
                                  <li
                                    key={`${g.groupId}-${a}`}
                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                                  >
                                    {CATALOG[a]?.name ?? a}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-600">No agents in this group.</p>
                            )}
                            <p className="mt-3 text-xs text-gray-400">{safeTruncate(g.groupId)}</p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ---------------------- Modal ---------------------- */}
      {modalOpen && modalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} aria-hidden="true" />
          <div className="relative z-10 w-[92vw] max-w-3xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {modalGroup.name || `Group ${safeTruncate(modalGroup.groupId)}`}
                </h3>
                <p className="text-xs text-gray-500">
                  {modalGroup.agents.length} agent{modalGroup.agents.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-5">
              {modalGroup.agents.length === 0 ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-600">
                  No agents in this group.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {modalGroup.agents.map((a) => {
                    const meta = CATALOG[a];
                    if (!meta) return null;
                    return (
                      <Link key={a} href={meta.href} onClick={closeModal}>
                        <Card className="group relative flex items-center gap-4 border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 cursor-pointer">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={`bg-gradient-to-br ${meta.color} text-white font-semibold`}>
                              {meta.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-black">{meta.name}</h4>
                            <p className="text-xs text-gray-500">Open agent</p>
                          </div>
                          <span className="opacity-0 transition-opacity group-hover:opacity-100">
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                          </span>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

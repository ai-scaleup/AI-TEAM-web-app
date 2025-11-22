"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUser, UserButton } from "@clerk/nextjs"

/* ---------------------------- API base URL ---------------------------- */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://ai-team-server.onrender.com"

/* ------------------------------ Types ------------------------------ */

interface AgentGroup {
  id: string
  name: string
  description?: string | null
  slug?: string | null
}

interface GroupAssignment {
  id: string
  email: string
  groupId: string
  isActive: boolean
  group?: AgentGroup
}

interface GroupAgentsResponse {
  group: {
    id: string
    name: string
    isActive: boolean
  }
  agents: string[]
  count: number
}

interface GroupAgent {
  id: string
  groupId: string
  agentName: string
  isActive: boolean
}

type UiAgent = {
  key: string
  name: string
  role: string
  image: string
  href: string
}

const agents: UiAgent[] = [
  {
    key: "ALEX",
    name: "Alex AI",
    role: "Cross-Platform ADs Manager",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/03/David-AI-Ai-Specialist-social-ads.png",
    href: "/dashboard/alex-ai",
  },
  {
    key: "TONY",
    name: "Tony AI",
    role: "Direttore Commerciale",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Tony-AI-strategiest.png",
    href: "/dashboard/tony-ai",
  },
  {
    key: "ALADINO",
    name: "Aladino AI",
    role: "Creatore di nuove offerte e prodotti",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Aladdin-AI-consultant.png",
    href: "/dashboard/aladino-ai",
  },
  {
    key: "LARA",
    name: "Lara AI",
    role: "Social Media Manager",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Lara-AI-social-strategiest.png",
    href: "/dashboard/lara-ai",
  },
  {
    key: "SIMONE",
    name: "Simone AI",
    role: "SEO Copywriter",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Simone-AI-seo-copy.png",
    href: "/dashboard/simone-ai",
  },
  {
    key: "MIKE",
    name: "Mike AI",
    role: "Direttore Marketing",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Mike-AI-digital-marketing-mg.png",
    href: "/dashboard/mike-ai",
  },
  {
    key: "VALENTINA",
    name: "Valentina AI",
    role: "SEO Optimizer",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/03/Valentina-AI-AI-SEO-optimizer.png",
    href: "/dashboard/valentina-ai",
  },
  {
    key: "NIKO",
    name: "Niko AI",
    role: "SEO Manager",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Niko-AI.png",
    href: "/dashboard/niko-ai",
  },
  {
    key: "JIM",
    name: "Jim AI",
    role: "Coach di Vendite",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Jim-AI-%E2%80%93-AI-Coach.png",
    href: "/dashboard/jim-ai",
  },
  {
    key: "DANIELE",
    name: "Daniele AI",
    role: "Copywriter per Vendere (Direct Response)",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/11/daniele_ai_direct_response_copywriter.png",
    href: "/dashboard/daniele-ai",
  },

  /* ------------------------- TEST AGENTS ------------------------- */

  {
    key: "TEST_MIKE",
    name: "Test Mike AI",
    role: "Test Direttore Marketing",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Mike-AI-digital-marketing-mg.png",
    href: "/dashboard/test-mike-ai",
  },
  {
    key: "TEST_ALEX",
    name: "Test Alex AI",
    role: "Test Cross-Platform ADs Manager",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/03/David-AI-Ai-Specialist-social-ads.png",
    href: "/dashboard/test-alex-ai",
  },
  {
    key: "TEST_TONY",
    name: "Test Tony AI",
    role: "Test Direttore Commerciale",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Tony-AI-strategiest.png",
    href: "/dashboard/test-tony-ai",
  },
  {
    key: "TEST_JIM",
    name: "Test Jim AI",
    role: "Test Coach di Vendite",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Jim-AI-%E2%80%93-AI-Coach.png",
    href: "/dashboard/test-jim-ai",
  },
  {
    key: "TEST_LARA",
    name: "Test Lara AI",
    role: "Test Social Media Manager",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Lara-AI-social-strategiest.png",
    href: "/dashboard/test-lara-ai",
  },
  {
    key: "TEST_VALENTINA",
    name: "Test Valentina AI",
    role: "Test SEO Optimizer",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/03/Valentina-AI-AI-SEO-optimizer.png",
    href: "/dashboard/test-valentina-ai",
  },
  {
    key: "TEST_DANIELE",
    name: "Test Daniele AI",
    role: "Test Copywriter per Vendere (Direct Response)",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/11/daniele_ai_direct_response_copywriter.png",
    href: "/dashboard/test-daniele-ai",
  },
  {
    key: "TEST_SIMONE",
    name: "Test Simone AI",
    role: "Test SEO Copywriter",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Simone-AI-seo-copy.png",
    href: "/dashboard/test-simone-ai",
  },
  {
    key: "TEST_NIKO",
    name: "Test Niko AI",
    role: "Test SEO Manager",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Niko-AI.png",
    href: "/dashboard/test-niko-ai",
  },
  {
    key: "TEST_ALADINO",
    name: "Test Aladino AI",
    role: "Test Creatore di nuove offerte e prodotti",
    image: "https://www.ai-scaleup.com/wp-content/uploads/2025/02/Aladdin-AI-consultant.png",
    href: "/dashboard/test-aladino-ai",
  },
]

/* -------------------------------- Page Component -------------------------------- */

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const [email, setEmail] = useState<string>("")
  const [assignedAgentNames, setAssignedAgentNames] = useState<string[]>([])
  const [assignedGroups, setAssignedGroups] = useState<GroupAssignment[]>([])
  const [selectedGroup, setSelectedGroup] = useState<AgentGroup | null>(null)
  const [groupAgents, setGroupAgents] = useState<UiAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalLoading, setIsModalLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!isLoaded) return

      if (!user?.primaryEmailAddress?.emailAddress) {
        setIsLoading(false)
        return
      }

      try {
        const userEmail = user.primaryEmailAddress.emailAddress
        setEmail(userEmail)

        console.log("[v0] Fetching data for user:", userEmail)

        // Fetch assigned agents
        const agentsRes = await fetch(`${API_BASE}/admin/selected-agents?email=${encodeURIComponent(userEmail)}`, {
          cache: "no-store",
        })
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json()
          console.log("[v0] Assigned agents:", agentsData)
          setAssignedAgentNames(agentsData)
        }

        // Fetch assigned groups
        const groupsRes = await fetch(
          `${API_BASE}/admin/group-assignments?email=${encodeURIComponent(userEmail)}&activeOnly=true`,
          { cache: "no-store" },
        )
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json()
          console.log("[v0] Assigned groups:", groupsData)
          setAssignedGroups(groupsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, isLoaded])

  const handleGroupClick = async (group: AgentGroup) => {
    setSelectedGroup(group)
    setIsModalLoading(true)

    try {
      const response = await fetch(`${API_BASE}/admin/groups/${group.id}/agents`)

      if (response.ok) {
        const groupData: GroupAgentsResponse = await response.json()

        console.log("[v0] Group data:", groupData)

        // Update the selected group with the name from the API
        setSelectedGroup({
          ...group,
          name: groupData.group.name,
        })

        // Map agent IDs to full agent objects
        const agentIds = groupData.agents
        const matchedAgents = agents.filter((agent) => agentIds.includes(agent.key))

        console.log("[v0] Matched agents:", matchedAgents)
        setGroupAgents(matchedAgents)
      } else {
        console.error("Failed to fetch group agents")
        setGroupAgents([])
      }
    } catch (error) {
      console.error("Error fetching group agents:", error)
      setGroupAgents([])
    } finally {
      setIsModalLoading(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedGroup(null)
    setGroupAgents([])
  }

  const visibleAgents = agents.filter((agent) => assignedAgentNames.includes(agent.key))

  if (isLoading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <p className="text-center text-sm text-muted-foreground sm:text-base">
          Devi effettuare il login per vedere i tuoi agenti assegnati.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] bg-tech-grid">
      <style jsx global>{`
        /* Tech Background Pattern */
        .bg-tech-grid {
          background-image: 
            linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Glassmorphism Cards */
        .glass-card {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        /* Holographic Hover Effect */
        .glass-card:hover {
          box-shadow: 0 0 25px rgba(14, 165, 233, 0.3), inset 0 0 0 1px rgba(14, 165, 233, 0.4);
          border-color: rgba(14, 165, 233, 0.5);
        }

        /* MANAGER EFFECT (AMARANTH RED) - For Mike AI */
        .manager-card {
          box-shadow: 0 0 30px rgba(229, 43, 80, 0.25);
          border-color: rgba(229, 43, 80, 0.8) !important;
          animation: manager-pulse 3s infinite alternate;
        }
        .manager-card:hover {
          box-shadow: 0 0 60px rgba(229, 43, 80, 0.5), inset 0 0 0 2px rgba(229, 43, 80, 0.6);
        }

        @keyframes manager-pulse {
          0% { box-shadow: 0 0 20px rgba(229, 43, 80, 0.2); }
          100% { box-shadow: 0 0 40px rgba(229, 43, 80, 0.4); }
        }

        /* Status Dot Pulse */
        @keyframes pulse-green-strong {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.9); opacity: 1; }
          50% { opacity: 0.8; }
          100% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); opacity: 1; }
        }
        .status-dot-active {
          animation: pulse-green-strong 1.5s infinite ease-in-out;
        }

        /* Character Image Masking */
        .character-image {
          mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
        }

        /* Hologram Scanline Animation */
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .hologram-bg {
          background-image: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%);
          background-size: 100% 4px;
        }
        .scan-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(14, 165, 233, 0.2), transparent);
          animation: scanline 2s linear infinite;
          pointer-events: none;
        }
        .manager-scan-bar {
          background: linear-gradient(to bottom, transparent, rgba(229, 43, 80, 0.3), transparent);
        }

        /* Group Card Hover */
        .group-card {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .group-card:hover {
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.3), inset 0 0 0 1px rgba(99, 102, 241, 0.4);
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateY(-4px);
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="relative mb-8 rounded-2xl glass-card px-4 py-6 text-center shadow-lg sm:mb-10 sm:px-6 sm:py-8 md:mb-12 md:px-8 md:py-10 lg:px-10">
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-[#0ea5e9]/30",
                },
              }}
            />
          </div>

          <h1 className="mb-2 font-sans text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-[36px] tracking-wide">
            Incontra i tuoi Specialisti AI
          </h1>
          <p className="text-sm text-white/70 sm:text-base md:text-lg">
            Qui trovi solo gli agenti AI e i gruppi che ti sono stati assegnati.
          </p>
        </header>

        {assignedGroups.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <h2 className="mb-3 font-sans text-xl font-semibold text-white sm:mb-4 sm:text-2xl tracking-wide">
              I tuoi Gruppi di Agenti
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {assignedGroups.map((assigned) => {
                if (!assigned.group) return null

                const group = assigned.group

                return (
                  <button key={assigned.id} onClick={() => handleGroupClick(group)} className="group text-left">
                    <div className="group-card flex h-full flex-col justify-between rounded-2xl p-4 sm:p-5 md:p-6">
                      <div>
                        <h3 className="mb-1.5 font-sans text-lg font-semibold text-white sm:mb-2 sm:text-xl md:text-[20px]">
                          {group.name}
                        </h3>
                        {group.description && <p className="text-xs text-white/60 sm:text-sm">{group.description}</p>}
                      </div>
                      <p className="mt-3 text-[10px] uppercase tracking-widest text-[#6366f1] font-bold sm:mt-4 sm:text-xs">
                        Gruppo di agenti AI
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 font-sans text-xl font-semibold text-white sm:mb-4 sm:text-2xl tracking-wide">
            I tuoi Agenti AI assegnati
          </h2>

          {visibleAgents.length === 0 ? (
            <p className="text-xs text-white/60 sm:text-sm">Nessun agente AI ti è stato ancora assegnato.</p>
          ) : (
            <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5">
              {visibleAgents.map((agent) => {
                const isManager = agent.name === "Mike AI" || agent.name === "Test Mike AI"

                return (
                  <Link key={agent.key} href={agent.href} className="group">
                    <div
                      className={`relative w-full aspect-[3/4] glass-card rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer ${isManager ? "manager-card" : ""}`}
                    >
                      {/* Background Glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90 z-10 pointer-events-none"></div>

                      {/* Image Container */}
                      <div className="absolute inset-0 w-full h-full">
                        <Image
                          src={agent.image || "/placeholder.svg"}
                          alt={agent.name}
                          fill
                          className="object-cover object-top transition duration-700 group-hover:scale-105 character-image"
                        />
                      </div>

                      {/* DEFAULT INFO (Visible when NOT hovering) */}
                      <div className="absolute bottom-0 left-0 w-full p-5 z-20 flex flex-col justify-end h-full group-hover:opacity-0 transition-opacity duration-300">
                        <div className="transform translate-y-2">
                          {/* Role & Name */}
                          <div
                            className={`border-l-4 pl-3 mb-1 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                          >
                            <h3
                              className={`text-3xl font-bold leading-none drop-shadow-md ${isManager ? "text-[#E52B50]" : "text-white"}`}
                            >
                              {agent.name}
                            </h3>
                            <p
                              className={`text-sm font-bold tracking-widest uppercase mt-1 ${isManager ? "text-[#E52B50]" : "text-[#0ea5e9]"}`}
                            >
                              {agent.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* FULL HOLOGRAM OVERLAY (Visible ONLY on Hover) */}
                      <div className="absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center hologram-bg backdrop-blur-md bg-[#020617]/90">
                        {/* Scanning Animation */}
                        <div className={`scan-bar ${isManager ? "manager-scan-bar" : ""}`}></div>

                        {/* Hologram Content */}
                        <div className="relative z-10 transform scale-95 group-hover:scale-100 transition-transform duration-500 delay-75">
                          <h3 className={`text-2xl font-bold mb-1 ${isManager ? "text-[#E52B50]" : "text-[#0ea5e9]"}`}>
                            {agent.name}
                          </h3>
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">{agent.role}</p>

                          <div
                            className={`h-px w-12 mx-auto mb-4 ${isManager ? "bg-[#E52B50]" : "bg-[#0ea5e9]"}`}
                          ></div>

                          <p className="text-white text-sm font-medium leading-relaxed px-2">
                            Clicca per accedere alla dashboard di {agent.name}
                          </p>

                          <div
                            className={`mt-6 px-6 py-2 rounded border font-bold uppercase text-xs tracking-widest inline-block
                            ${isManager ? "border-[#E52B50] text-[#E52B50]" : "border-[#0ea5e9] text-[#0ea5e9]"}`}
                          >
                            Accedi
                          </div>
                        </div>

                        {/* Tech Corners */}
                        <div
                          className={`absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                        ></div>
                        <div
                          className={`absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                        ></div>
                        <div
                          className={`absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                        ></div>
                        <div
                          className={`absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                        ></div>
                      </div>

                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] status-dot-active"></div>
                        <span className="text-[10px] font-bold tracking-wider text-white uppercase">Active</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </main>
          )}
        </section>
      </div>

      <Dialog open={!!selectedGroup} onOpenChange={handleCloseModal}>
        <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl bg-[#0f172a]/95 border-white/10 backdrop-blur-xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold sm:text-2xl text-white">{selectedGroup?.name}</DialogTitle>
            {selectedGroup?.description && (
              <p className="text-xs text-white/60 sm:text-sm">{selectedGroup.description}</p>
            )}
          </DialogHeader>

          <div className="mt-4 sm:mt-6">
            {isModalLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0ea5e9] border-t-transparent" />
              </div>
            ) : groupAgents.length === 0 ? (
              <p className="py-6 text-center text-xs text-white/60 sm:py-8 sm:text-sm">
                Nessun agente trovato in questo gruppo.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                {groupAgents.map((agent) => {
                  const isManager = agent.name === "Mike AI" || agent.name === "Test Mike AI"

                  return (
                    <Link key={agent.key} href={agent.href} className="group" onClick={handleCloseModal}>
                      <div
                        className={`relative w-full aspect-[3/4] glass-card rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-pointer ${isManager ? "manager-card" : ""}`}
                      >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90 z-10 pointer-events-none"></div>

                        {/* Image Container */}
                        <div className="absolute inset-0 w-full h-full">
                          <Image
                            src={agent.image || "/placeholder.svg"}
                            alt={agent.name}
                            fill
                            className="object-cover object-top transition duration-700 group-hover:scale-105 character-image"
                          />
                        </div>

                        {/* DEFAULT INFO */}
                        <div className="absolute bottom-0 left-0 w-full p-4 z-20 flex flex-col justify-end h-full group-hover:opacity-0 transition-opacity duration-300">
                          <div className="transform translate-y-2">
                            <div
                              className={`border-l-4 pl-3 mb-1 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                            >
                              <h3
                                className={`text-2xl font-bold leading-none drop-shadow-md ${isManager ? "text-[#E52B50]" : "text-white"}`}
                              >
                                {agent.name}
                              </h3>
                              <p
                                className={`text-xs font-bold tracking-widest uppercase mt-1 ${isManager ? "text-[#E52B50]" : "text-[#0ea5e9]"}`}
                              >
                                {agent.role}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* HOLOGRAM OVERLAY */}
                        <div className="absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-4 text-center hologram-bg backdrop-blur-md bg-[#020617]/90">
                          <div className={`scan-bar ${isManager ? "manager-scan-bar" : ""}`}></div>

                          <div className="relative z-10 transform scale-95 group-hover:scale-100 transition-transform duration-500">
                            <h3 className={`text-xl font-bold mb-1 ${isManager ? "text-[#E52B50]" : "text-[#0ea5e9]"}`}>
                              {agent.name}
                            </h3>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">{agent.role}</p>

                            <div
                              className={`h-px w-10 mx-auto mb-3 ${isManager ? "bg-[#E52B50]" : "bg-[#0ea5e9]"}`}
                            ></div>

                            <div
                              className={`mt-4 px-4 py-1.5 rounded border font-bold uppercase text-[10px] tracking-widest inline-block
                              ${isManager ? "border-[#E52B50] text-[#E52B50]" : "border-[#0ea5e9] text-[#0ea5e9]"}`}
                            >
                              Accedi
                            </div>
                          </div>

                          {/* Tech Corners */}
                          <div
                            className={`absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                          ></div>
                          <div
                            className={`absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                          ></div>
                          <div
                            className={`absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                          ></div>
                          <div
                            className={`absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 ${isManager ? "border-[#E52B50]" : "border-[#0ea5e9]"}`}
                          ></div>
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] status-dot-active"></div>
                          <span className="text-[9px] font-bold tracking-wider text-white uppercase">Active</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

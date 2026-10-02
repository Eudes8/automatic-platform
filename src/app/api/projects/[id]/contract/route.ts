import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser, notify, makeReference } from "@/lib/auth"
import { handleError } from "@/lib/api"
import { formatAmount } from "@/lib/platform"

type Params = { params: Promise<{ id: string }> }

function buildContractContent(title: string, clientName: string, budget: number, timeline: string | null, reference: string): string {
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  return `CONTRAT DE PRESTATION NUMÉRIQUE — ${reference}

Entre AUTOMATIC, agence digitale (ci-après « le Prestataire »),
Et ${clientName} (ci-après « le Client »),

Article 1 — Objet
Le Prestataire s'engage à réaliser le projet « ${title} » selon les spécifications validées dans le cahier des charges. ${timeline ? `Durée estimée de réalisation : ${timeline}.` : ""}

Article 2 — Prix et modalités de paiement
Le montant total du projet est fixé à ${formatAmount(budget)}, payable en trois phases : 40% au démarrage, 40% au développement, 20% à la livraison. Aucun remboursement n'est effectué après le début de la phase de développement.

Article 3 — Livraison
Le Prestataire livre le projet à l'issue de la phase de recette. Le Client dispose de 7 jours ouvrés pour formuler ses réserves. Passé ce délai, le projet est réputé accepté.

Article 4 — Propriété intellectuelle
Après paiement intégral, l'intégralité du code source et des livrables est cédée au Client. Le Prestataire conserve le droit de présenter le projet dans son portfolio.

Article 5 — Confidentialité
Chaque partie s'engage à ne pas divulguer les informations confidentielles de l'autre partie pendant toute la durée du contrat et 2 ans après son terme.

Article 6 — Support
Une garantie de 30 jours couvre les corrections de bugs après la livraison. Le support étendu et les évolutions font l'objet d'un devis séparé.

Article 7 — Litiges
Tout litige relatif à l'interprétation ou l'exécution du présent contrat sera soumis à médiation préalable avant toute action judiciaire.

Fait à Abidjan, le ${today}.`
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: { client: true, contracts: { orderBy: { createdAt: "desc" }, take: 1 } },
    })
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && project.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    let contract = project.contracts[0]
    if (!contract) {
      contract = await db.contract.create({
        data: {
          projectId: id,
          content: buildContractContent(project.title, project.client.name, project.budget, project.timeline, project.reference),
          status: "DRAFT",
        },
      })
    }
    return NextResponse.json({ contract })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    if (user.role !== "CLIENT") {
      return NextResponse.json({ error: "Seul le client signe le contrat" }, { status: 403 })
    }
    const project = await db.project.findUnique({ where: { id }, include: { contracts: { orderBy: { createdAt: "desc" }, take: 1 } } })
    if (!project || project.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    if (project.contractSigned) {
      return NextResponse.json({ error: "Contrat déjà signé" }, { status: 409 })
    }

    const body = await req.json()
    const signature: string | undefined = body?.signature
    if (!signature || !signature.startsWith("data:image")) {
      return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
    }

    let contract = project.contracts[0]
    if (!contract) {
      contract = await db.contract.create({
        data: {
          projectId: id,
          content: buildContractContent(project.title, user.name, project.budget, project.timeline, project.reference),
          status: "DRAFT",
        },
      })
    }

    const signed = await db.contract.update({
      where: { id: contract.id },
      data: { signatureData: signature, signerName: user.name, signedAt: new Date(), status: "SIGNED" },
    })
    await db.project.update({ where: { id }, data: { contractSigned: true, status: project.status === "ONBOARDING" ? "ANALYSIS" : project.status } })

    // Génération de la facture d'acompte (40%) — amélioration V2
    const invoiceCount = await db.invoice.count()
    const deposit = Math.round(project.budget * 0.4)
    await db.invoice.create({
      data: {
        number: makeReference("FAC", invoiceCount),
        projectId: id,
        clientId: user.id,
        amount: deposit,
        status: "SENT",
        description: `Acompte de démarrage (40%) — ${project.title}`,
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    })

    const admins = await db.user.findMany({ where: { role: "ADMIN" } })
    await Promise.all(
      admins.map((a) =>
        notify(a.id, "Contrat signé ✍️", `${user.name} a signé le contrat du projet « ${project.title} ». Facture d'acompte générée automatiquement.`, "SUCCESS")
      )
    )
    await notify(user.id, "Contrat signé ✅", "Merci ! Votre projet démarre. La facture d'acompte (40%) est disponible dans la facturation.", "SUCCESS")

    return NextResponse.json({ contract: signed })
  } catch (e) {
    return handleError(e)
  }
}

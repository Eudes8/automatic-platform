"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { FileSignature, Loader2, PenLine, Trash2 } from "lucide-react"

type Contract = {
  id: string
  content: string
  signatureData: string | null
  signerName: string | null
  signedAt: string | null
  status: string
}

function SignaturePad({ onConfirm }: { onConfirm: (dataUrl: string) => Promise<void> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [empty, setEmpty] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    ctx.lineWidth = 2.2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#f4f4f5"
  }, [])

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    setDrawing(true)
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setEmpty(false)
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setEmpty(true)
  }

  async function confirm() {
    if (empty) {
      toast.error("Veuillez apposer votre signature")
      return
    }
    setSaving(true)
    try {
      const canvas = canvasRef.current
      if (canvas) await onConfirm(canvas.toDataURL("image/png"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-zinc-700 bg-zinc-950/80 relative">
        <canvas ref={canvasRef} className="w-full h-[140px] touch-none cursor-crosshair"
          onPointerDown={start} onPointerMove={move} onPointerUp={() => setDrawing(false)} onPointerLeave={() => setDrawing(false)} />
        {empty && <p className="absolute inset-0 flex items-center justify-center text-sm text-zinc-600 pointer-events-none">Signez ici avec votre souris ou votre doigt ✍️</p>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={clear} className="border-zinc-700 text-zinc-300">
          <Trash2 size={14} className="mr-1.5" /> Effacer
        </Button>
        <Button onClick={confirm} disabled={saving} size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
          {saving && <Loader2 size={14} className="animate-spin mr-1.5" />}
          <PenLine size={14} className="mr-1.5" /> Signer et démarrer le projet
        </Button>
      </div>
    </div>
  )
}

export function ContractDialog({
  projectId,
  signed,
  signedAt,
  onSigned,
  trigger,
}: {
  projectId: string
  signed: boolean
  signedAt?: string | null
  onSigned?: () => void
  trigger?: React.ReactNode
}) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch(`/api/projects/${projectId}/contract`)
      .then((r) => r.json())
      .then((d) => setContract(d.contract))
      .catch(() => {})
  }, [open, projectId])

  async function sign(dataUrl: string) {
    const res = await fetch(`/api/projects/${projectId}/contract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: dataUrl }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? "Erreur lors de la signature")
      return
    }
    toast.success("Contrat signé ! Le projet démarre et votre facture d'acompte est générée. 🎉")
    setOpen(false)
    onSigned?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" disabled={signed} className={signed ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold"}>
            <FileSignature size={15} className="mr-1.5" />
            {signed ? `Signé le ${signedAt ? new Date(signedAt).toLocaleDateString("fr-FR") : "—"}` : "Lire et signer le contrat"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-zinc-900 border-white/10 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature size={18} className="text-emerald-400" /> Contrat de prestation
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed flex-1 min-h-0">
          {contract?.content ?? "Chargement du contrat…"}
        </div>
        <div className="pt-4">
          {contract?.status === "SIGNED" ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              {contract.signatureData && (
                <img src={contract.signatureData} alt="Signature" className="h-12 rounded bg-zinc-950/60 px-2" />
              )}
              <div className="text-sm">
                <p className="font-semibold text-emerald-400">Contrat signé</p>
                <p className="text-xs text-zinc-400">Par {contract.signerName} — {contract.signedAt && new Date(contract.signedAt).toLocaleString("fr-FR")}</p>
              </div>
            </div>
          ) : (
            <SignaturePad onConfirm={sign} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

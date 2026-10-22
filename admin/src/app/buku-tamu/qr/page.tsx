import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import QRCode from "qrcode"
import { AuthGuard } from "@/components/auth-guard"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getProfile } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import api from "@/lib/api"
import { Download, Info, Printer, QrCode, RefreshCcw, ShieldCheck, Wifi } from "lucide-react"
import { toast } from "sonner"
import { OpdScopeSelect } from "../components/opd-scope-select"
import { SearchableSelect } from "../components/searchable-select"
import { apiErrorMessage, type GuestbookLocation, type OpdOption } from "../types"

const posterPresets = {
  a4: { label: "A4 — 21 × 29,7 cm", widthMm: 210, heightMm: 297 },
  a5: { label: "A5 — 14,8 × 21 cm", widthMm: 148, heightMm: 210 },
  acrylic_20x30: { label: "Akrilik — 20 × 30 cm", widthMm: 200, heightMm: 300 },
  acrylic_15x20: { label: "Akrilik — 15 × 20 cm", widthMm: 150, heightMm: 200 },
  acrylic_10x15: { label: "Akrilik — 10 × 15 cm", widthMm: 100, heightMm: 150 },
} as const

type PosterPreset = keyof typeof posterPresets | "custom"

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }
}

export default function GuestbookQrPage() {
  const profile = getProfile()
  const isSuperAdmin = Number(profile?.menu_klp) === 1
  const canCreate = hasPermission("guestbook_qr", "create")
  const queryClient = useQueryClient()
  const [opdId, setOpdId] = useState(isSuperAdmin ? "" : profile?.opd_id || "")
  const [label, setLabel] = useState("Meja Resepsionis")
  const [wifiSsid, setWifiSsid] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [posterPreset, setPosterPreset] = useState<PosterPreset>("acrylic_20x30")
  const [customWidthCm, setCustomWidthCm] = useState(20)
  const [customHeightCm, setCustomHeightCm] = useState(30)
  const [previewScale, setPreviewScale] = useState(1)
  const posterPreviewRef = useRef<HTMLDivElement>(null)

  const { data: opdOptions = [] } = useQuery({
    queryKey: ["guestbook-opd-options"],
    queryFn: async () => {
      const response = await api.get("/api/v1/pegawai/instansi")
      return (response.data?.data || []) as OpdOption[]
    },
    enabled: isSuperAdmin,
    staleTime: 10 * 60 * 1000,
  })

  const qrQuery = useQuery({
    queryKey: ["guestbook-current-qr", opdId],
    queryFn: async () => {
      const response = await api.get("/api/v1/guestbook/qr", { params: opdId ? { opd_id: opdId } : undefined })
      return (response.data.data || null) as GuestbookLocation | null
    },
    enabled: !isSuperAdmin || Boolean(opdId),
  })

  const location = qrQuery.data
  const publicUrl = useMemo(() => location ? `${window.location.origin}/buku-tamu/form/${location.token}` : "", [location])

  useEffect(() => {
    if (!location) return
    setLabel(location.label || "Meja Resepsionis")
    setWifiSsid(location.wifi_ssid || "")
    setWifiPassword(location.wifi_password === "FREE" ? "" : location.wifi_password || "")
  }, [location?.id])

  const qrImageQuery = useQuery({
    queryKey: ["guestbook-qr-image", publicUrl],
    queryFn: async () => {
      if (!publicUrl) return ""
      const canvas = document.createElement("canvas")
      await QRCode.toCanvas(canvas, publicUrl, {
        width: 960,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#064e3b", light: "#ffffff" },
      })

      const ctx = canvas.getContext("2d")
      if (!ctx) return canvas.toDataURL("image/png")

      const logo = new Image()
      logo.src = "/logo_konsel.png"
      await new Promise<void>((resolve) => {
        if (logo.complete && logo.naturalWidth > 0) {
          resolve()
        } else {
          logo.onload = () => resolve()
          logo.onerror = () => resolve()
        }
      })

      if (logo.complete && logo.naturalWidth > 0) {
        const size = canvas.width
        const badgeSize = Math.round(size * 0.22)
        const x = (size - badgeSize) / 2
        const y = (size - badgeSize) / 2
        const radius = Math.round(badgeSize * 0.22)

        // Draw shadow & white background badge
        ctx.save()
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)"
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 3

        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        drawRoundedRect(ctx, x, y, badgeSize, badgeSize, radius)
        ctx.fill()
        ctx.restore()

        // Draw subtle border
        ctx.save()
        ctx.strokeStyle = "#e2e8f0"
        ctx.lineWidth = 3
        ctx.beginPath()
        drawRoundedRect(ctx, x, y, badgeSize, badgeSize, radius)
        ctx.stroke()
        ctx.restore()

        // Draw Logo Konsel centered
        const padding = Math.round(badgeSize * 0.12)
        const maxLogoW = badgeSize - padding * 2
        const maxLogoH = badgeSize - padding * 2
        const aspect = logo.naturalWidth / logo.naturalHeight
        let drawW = maxLogoW
        let drawH = maxLogoW / aspect
        if (drawH > maxLogoH) {
          drawH = maxLogoH
          drawW = maxLogoH * aspect
        }
        const drawX = x + (badgeSize - drawW) / 2
        const drawY = y + (badgeSize - drawH) / 2

        ctx.drawImage(logo, drawX, drawY, drawW, drawH)
      }

      return canvas.toDataURL("image/png")
    },
    enabled: Boolean(publicUrl),
    staleTime: Infinity,
  })
  const qrDataUrl = qrImageQuery.data || ""
  const posterSize = useMemo(() => {
    if (posterPreset !== "custom") return posterPresets[posterPreset]
    return {
      label: `Custom — ${customWidthCm || 0} × ${customHeightCm || 0} cm`,
      widthMm: Math.max(50, Number(customWidthCm || 0) * 10),
      heightMm: Math.max(50, Number(customHeightCm || 0) * 10),
    }
  }, [posterPreset, customWidthCm, customHeightCm])
  const basePosterWidth = 520
  const basePosterHeight = basePosterWidth * (posterSize.heightMm / posterSize.widthMm)
  const printScale = (posterSize.widthMm * 96 / 25.4) / basePosterWidth

  useEffect(() => {
    const preview = posterPreviewRef.current
    if (!preview) return
    const updateScale = () => setPreviewScale(Math.min(1, preview.clientWidth / basePosterWidth))
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(preview)
    return () => observer.disconnect()
  }, [location?.id, qrDataUrl, posterSize.widthMm, posterSize.heightMm])

  const generateMutation = useMutation({
    mutationFn: async () => {
      const selectedOpd = opdOptions.find((item) => String(item.id) === opdId)
      const response = await api.post("/api/v1/guestbook/qr", {
        opd_id: isSuperAdmin ? opdId : undefined,
        opd_name: isSuperAdmin ? selectedOpd?.instansi : profile?.opd,
        label,
        wifi_ssid: wifiSsid,
        wifi_password: wifiPassword,
      })
      return response.data as { message: string; data: GuestbookLocation }
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["guestbook-current-qr", opdId], response.data)
      toast.success(response.message)
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, "Gagal membuat QR Buku Tamu")),
  })

  const downloadQr = () => {
    if (!qrDataUrl || !location) return
    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = `qr-buku-tamu-${location.opd_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`
    link.click()
  }

  const printPoster = () => {
    if (posterSize.widthMm < 80 || posterSize.heightMm < 100) {
      toast.error("Ukuran poster terlalu kecil. Gunakan minimal 8 × 10 cm.")
      return
    }
    if (posterSize.heightMm / posterSize.widthMm < 1.2) {
      toast.error("Gunakan format portrait dengan tinggi minimal 1,2 kali lebarnya agar desain tidak terpotong.")
      return
    }
    window.print()
  }

  const changeOpd = (value: string) => {
    setOpdId(value)
    setLabel("Meja Resepsionis")
    setWifiSsid("")
    setWifiPassword("")
  }

  return (
    <AuthGuard>
      <style>{`
        @media print {
          @page { size: ${posterSize.widthMm}mm ${posterSize.heightMm}mm; margin: 0; }
          html, body, #root {
            width: ${posterSize.widthMm}mm !important;
            height: ${posterSize.heightMm}mm !important;
          }
          .guestbook-print-area {
            width: ${basePosterWidth}px !important;
            height: ${basePosterHeight}px !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            transform: scale(${printScale}) !important;
            transform-origin: top left !important;
          }
          .guestbook-poster-preview {
            position: static !important;
            width: 0 !important;
            height: 0 !important;
            overflow: visible !important;
          }
        }
      `}</style>
      <BaseLayout title="Generate QR Buku Tamu" description="Buat, unduh, dan cetak QR khusus untuk meja pelayanan setiap OPD">
        <div className="guestbook-qr-page grid min-w-0 gap-4 px-3 sm:gap-5 sm:px-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-6">
          <div className="guestbook-no-print min-w-0 space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="size-5 text-emerald-600" /> Pengaturan QR</CardTitle><CardDescription>QR mengarahkan tamu ke formulir khusus OPD tujuan.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {isSuperAdmin ? <OpdScopeSelect value={opdId} options={opdOptions} onChange={changeOpd} allowAll={false} label="OPD Tujuan" /> : <div className="rounded-lg border bg-muted/40 p-3"><p className="text-xs text-muted-foreground">OPD akun</p><p className="mt-1 text-sm font-semibold">{profile?.opd || "Belum terhubung"}</p></div>}
                <div className="grid gap-1.5"><Label htmlFor="guestbook-label">Nama titik pelayanan</Label><Input id="guestbook-label" value={label} maxLength={120} onChange={(event) => setLabel(event.target.value)} placeholder="Contoh: Meja Resepsionis Utama" /></div>
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <div className="flex items-start gap-2"><Wifi className="mt-0.5 size-4 shrink-0 text-emerald-700" /><div><p className="text-sm font-semibold">Informasi Wi-Fi Tamu</p><p className="text-xs text-muted-foreground">Opsional, akan ditampilkan pada poster.</p></div></div>
                  <div className="grid gap-1.5"><Label htmlFor="wifi-ssid">Nama Wi-Fi / Username</Label><Input id="wifi-ssid" value={wifiSsid} maxLength={120} onChange={(event) => setWifiSsid(event.target.value)} placeholder="Contoh: WIFI TAMU KONSEL" autoComplete="off" /></div>
                  {wifiSsid.trim() && <div className="grid gap-1.5"><Label htmlFor="wifi-password">Password</Label><Input id="wifi-password" value={wifiPassword} maxLength={120} onChange={(event) => setWifiPassword(event.target.value)} placeholder="Kosongkan jika FREE" autoComplete="off" /><p className="text-[11px] text-muted-foreground">Jika dikosongkan, poster akan menampilkan password FREE.</p></div>}
                </div>
                <div className="grid gap-1.5">
                  <Label>Ukuran poster / akrilik</Label>
                  <SearchableSelect
                    value={posterPreset}
                    onValueChange={(value) => setPosterPreset(value as PosterPreset)}
                    searchPlaceholder="Cari ukuran poster..."
                    options={[
                      ...Object.entries(posterPresets).map(([value, preset]) => ({ value, label: preset.label })),
                      { value: "custom", label: "Ukuran custom" },
                    ]}
                  />
                </div>
                {posterPreset === "custom" && (
                  <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                    <div className="grid gap-1.5"><Label htmlFor="poster-width">Lebar (cm)</Label><Input id="poster-width" type="number" min={8} max={100} step={0.1} value={customWidthCm} onChange={(event) => setCustomWidthCm(Number(event.target.value))} /></div>
                    <div className="grid gap-1.5"><Label htmlFor="poster-height">Tinggi (cm)</Label><Input id="poster-height" type="number" min={10} max={150} step={0.1} value={customHeightCm} onChange={(event) => setCustomHeightCm(Number(event.target.value))} /></div>
                  </div>
                )}
                <Button className="w-full" disabled={!canCreate || (isSuperAdmin && !opdId) || generateMutation.isPending} onClick={() => generateMutation.mutate()}>{location ? <RefreshCcw className="mr-2 size-4" /> : <QrCode className="mr-2 size-4" />}{generateMutation.isPending ? "Membuat QR..." : location ? "Regenerasi QR" : "Generate QR"}</Button>
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><Info className="mt-0.5 size-4 shrink-0" /><span>Regenerasi akan menonaktifkan QR lama. Gunakan hanya jika QR sebelumnya hilang atau perlu diganti.</span></div>
              </CardContent>
            </Card>
            {location && <Card className="gap-3 py-4"><CardContent className="space-y-3 px-4 sm:px-6"><div><p className="text-xs text-muted-foreground">Tautan formulir</p><p className="mt-1 break-all rounded-md bg-muted px-3 py-2 text-xs">{publicUrl}</p></div><div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">Hasil cetak: <b className="text-foreground">{posterSize.label}</b>. Pilih skala 100% dan margin none pada dialog printer.</div><div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2"><Button className="w-full" variant="outline" onClick={downloadQr}><Download className="mr-2 size-4" />Unduh QR</Button><Button className="w-full" variant="outline" onClick={printPoster}><Printer className="mr-2 size-4" />Cetak Poster</Button></div></CardContent></Card>}
          </div>

          <div className="flex min-w-0 items-start justify-center overflow-hidden rounded-2xl border bg-muted/30 p-2 min-[360px]:p-3 sm:min-h-[650px] sm:p-8">
            {qrQuery.isLoading && <Skeleton className="h-[440px] w-full max-w-[520px] sm:h-[640px]" />}
            {!qrQuery.isLoading && !location && <div className="guestbook-no-print flex min-h-[360px] max-w-sm flex-col items-center justify-center px-3 text-center sm:min-h-[580px]"><div className="rounded-full bg-emerald-500/10 p-4 sm:p-5"><QrCode className="size-10 text-emerald-600 sm:size-12" /></div><h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">QR belum tersedia</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{isSuperAdmin && !opdId ? "Pilih OPD terlebih dahulu untuk melihat atau membuat QR." : "Buat QR pertama untuk menerima tamu secara digital."}</p></div>}
            {location && qrDataUrl && (
              <div ref={posterPreviewRef} style={{ aspectRatio: `${posterSize.widthMm} / ${posterSize.heightMm}` }} className="guestbook-poster-preview relative w-full max-w-[520px] overflow-hidden rounded-[20px] bg-white shadow-xl ring-1 ring-slate-200 sm:rounded-[28px]">
                <article style={{ width: basePosterWidth, height: basePosterHeight, transform: `scale(${previewScale})`, transformOrigin: "top left" }} className="guestbook-print-area absolute left-0 top-0 overflow-hidden bg-white text-slate-900">
                  <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-700 via-lime-500 to-amber-400" />
                  <div className="relative h-full px-8 pb-6 pt-7 text-center">
                    <div className="mx-auto flex items-center justify-center gap-5">
                      <img src="/logo_konsel.png" alt="Logo Kabupaten Konawe Selatan" className="h-14 w-12 object-contain" />
                      <div className="h-11 w-px bg-slate-200" />
                      <img src="/new_logo_Setara.png" alt="Logo Konsel Setara" className="h-14 w-40 object-contain" />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Pemerintah Kabupaten Konawe Selatan</p>
                    <h2 className="mx-auto mt-2 max-w-md text-2xl font-black leading-tight">BUKU TAMU DIGITAL</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-snug text-slate-600">{location.opd_name}</p>

                    <div className="mx-auto mt-5 w-fit rounded-[24px] bg-gradient-to-br from-emerald-700 to-emerald-950 p-3 shadow-lg shadow-emerald-900/20">
                      <div className="rounded-[16px] bg-white p-3"><img src={qrDataUrl} alt="QR Buku Tamu" className={wifiSsid.trim() ? "size-48" : "size-56"} /></div>
                    </div>
                    <div className="mt-4"><p className="text-lg font-extrabold text-emerald-800">SCAN UNTUK MENGISI</p><p className="mt-1 text-sm text-slate-500">Arahkan kamera ponsel ke QR Code</p></div>

                    <div className="mt-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm"><p className="font-bold text-emerald-900">{label || location.label}</p><p className="mt-1 text-xs leading-relaxed text-emerald-800/80">Data kunjungan Anda tercatat secara aman dan hanya digunakan untuk kebutuhan pelayanan.</p></div>
                    {wifiSsid.trim() && <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-left"><div className="flex items-center gap-2 text-emerald-800"><Wifi className="size-4" /><p className="text-xs font-extrabold tracking-wide">WIFI TAMU</p></div><div className="mt-2 grid grid-cols-[74px_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs"><span className="text-slate-500">Username</span><b className="break-all text-slate-800">: {wifiSsid}</b><span className="text-slate-500">Password</span><b className="break-all text-slate-800">: {wifiPassword.trim() || "FREE"}</b></div></div>}
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400"><ShieldCheck className="size-3.5" /> Cepat · Aman · Tanpa Kertas</div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>
      </BaseLayout>
    </AuthGuard>
  )
}

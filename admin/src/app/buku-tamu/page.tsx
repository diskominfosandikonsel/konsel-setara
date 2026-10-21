import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { AuthGuard } from "@/components/auth-guard"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getProfile } from "@/lib/auth"
import api from "@/lib/api"
import { Building2, CalendarDays, ContactRound, FileText, Loader2, Printer, UserRound, UsersRound } from "lucide-react"
import { toast } from "sonner"
import { OpdScopeSelect } from "./components/opd-scope-select"
import { SearchableSelect } from "./components/searchable-select"
import {
  buildGuestbookReportHtml,
  getReportRange,
  isoWeekValue,
  monthValue,
  reportPeriodLabel,
  todayValue,
  type GuestbookReportResponse,
  type ReportPeriodType,
} from "./report"
import { apiErrorMessage, formatDateTime, formatNumber, type GuestbookVisit, type OpdOption, visitorTypeLabel } from "./types"

interface SummaryData {
  totals: {
    total: number
    today: number
    this_month: number
    internal_total: number
    external_total: number
  }
  trend: { date: string; total: number }[]
  recent: GuestbookVisit[]
  scope: { id: string; name: string } | null
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function GuestbookDashboardPage() {
  const profile = getProfile()
  const isSuperAdmin = Number(profile?.menu_klp) === 1
  const [opdId, setOpdId] = useState("")
  const [reportType, setReportType] = useState<ReportPeriodType>("daily")
  const [reportDate, setReportDate] = useState(todayValue())
  const [reportWeek, setReportWeek] = useState(isoWeekValue())
  const [reportMonth, setReportMonth] = useState(monthValue())
  const [isPrintingReport, setIsPrintingReport] = useState(false)

  const { data: opdOptions = [] } = useQuery({
    queryKey: ["guestbook-opd-options"],
    queryFn: async () => {
      const response = await api.get("/api/v1/pegawai/instansi")
      return (response.data?.data || []) as OpdOption[]
    },
    enabled: isSuperAdmin,
    staleTime: 10 * 60 * 1000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["guestbook-summary", opdId],
    queryFn: async () => {
      const response = await api.get("/api/v1/guestbook/summary", { params: opdId ? { opd_id: opdId } : undefined })
      return response.data.data as SummaryData
    },
  })

  const chartData = useMemo(() => {
    const counts = new Map((data?.trend || []).map((item) => [String(item.date).slice(0, 10), item.total]))
    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (29 - index))
      const key = dateKey(date)
      return {
        date: key,
        label: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(date),
        total: counts.get(key) || 0,
      }
    })
  }, [data?.trend])

  const reportValue = reportType === "daily" ? reportDate : reportType === "weekly" ? reportWeek : reportMonth
  const reportRange = useMemo(() => getReportRange(reportType, reportValue), [reportType, reportValue])

  const printReport = async () => {
    if (!reportRange) {
      toast.error("Pilih periode laporan yang valid.")
      return
    }

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("Popup cetak diblokir browser. Izinkan popup lalu coba kembali.")
      return
    }

    printWindow.opener = null
    printWindow.document.write('<!doctype html><html><body style="font-family:Arial;padding:32px;color:#475569">Menyiapkan laporan Buku Tamu...</body></html>')
    printWindow.document.close()
    setIsPrintingReport(true)

    try {
      const response = await api.get("/api/v1/guestbook/report", {
        params: {
          opd_id: opdId || undefined,
          date_from: reportRange.from,
          date_to: reportRange.to,
        },
      })
      const report = response.data as GuestbookReportResponse
      const html = buildGuestbookReportHtml({
        records: report.data || [],
        range: reportRange,
        scopeName: report.scope?.name || profile?.opd || "OPD",
        generatedBy: profile?.nama || profile?.username || "Administrator",
        generatedAt: report.generated_at,
        logoKonselUrl: `${window.location.origin}/logo_konsel.png`,
      })
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    } catch (error) {
      printWindow.close()
      toast.error(apiErrorMessage(error, "Laporan Buku Tamu gagal disiapkan."))
    } finally {
      setIsPrintingReport(false)
    }
  }

  const totals = data?.totals || { total: 0, today: 0, this_month: 0, internal_total: 0, external_total: 0 }
  const cards = [
    { label: "Tamu Hari Ini", value: totals.today, icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Bulan Ini", value: totals.this_month, icon: UsersRound, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Total Kunjungan", value: totals.total, icon: ContactRound, color: "text-violet-600", bg: "bg-violet-500/10" },
    { label: "ASN Konsel", value: totals.internal_total, icon: UserRound, color: "text-amber-600", bg: "bg-amber-500/10" },
  ]

  return (
    <AuthGuard>
      <BaseLayout title="Rekap Buku Tamu" description="Ringkasan kunjungan tamu digital Pemerintah Kabupaten Konawe Selatan">
        <div className="min-w-0 space-y-4 px-3 sm:space-y-6 sm:px-4 lg:px-6">
          <div className="flex min-w-0 flex-col items-stretch gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-semibold"><Building2 className="size-4 text-emerald-600" /> Lingkup Data</div>
              <p className="mt-1 text-sm text-muted-foreground">{isSuperAdmin ? "Pilih OPD atau lihat rekap seluruh OPD." : profile?.opd || "OPD Anda"}</p>
            </div>
            {isSuperAdmin && <OpdScopeSelect value={opdId} options={opdOptions} onChange={setOpdId} />}
          </div>

          <Card className="gap-4 py-5">
            <CardContent className="px-4 sm:px-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="shrink-0 rounded-xl bg-emerald-500/10 p-2.5"><FileText className="size-5 text-emerald-700" /></div>
                <div className="min-w-0"><p className="font-semibold">Cetak Laporan Buku Tamu</p><p className="text-sm leading-relaxed text-muted-foreground">Pilih periode lalu cetak atau simpan sebagai PDF dengan data kunjungan lengkap.</p></div>
              </div>
              <div className="grid gap-3 md:grid-cols-[210px_minmax(220px,1fr)_auto] md:items-end">
                <div className="grid gap-1.5">
                  <Label>Jenis Periode</Label>
                  <SearchableSelect
                    value={reportType}
                    onValueChange={(value) => setReportType(value as ReportPeriodType)}
                    searchPlaceholder="Cari periode..."
                    options={[
                      { value: "daily", label: "Harian" },
                      { value: "weekly", label: "Mingguan" },
                      { value: "monthly", label: "Bulanan" },
                    ]}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="guestbook-report-period">{reportType === "daily" ? "Pilih Tanggal" : reportType === "weekly" ? "Pilih Minggu" : "Pilih Bulan"}</Label>
                  <Input
                    id="guestbook-report-period"
                    type={reportType === "daily" ? "date" : reportType === "weekly" ? "week" : "month"}
                    value={reportValue}
                    onChange={(event) => {
                      if (reportType === "daily") setReportDate(event.target.value)
                      else if (reportType === "weekly") setReportWeek(event.target.value)
                      else setReportMonth(event.target.value)
                    }}
                  />
                </div>
                <Button onClick={printReport} disabled={isPrintingReport || !reportRange || (isSuperAdmin && !opdId)} className="w-full md:min-w-48 md:w-auto">
                  {isPrintingReport ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Printer className="mr-2 size-4" />}
                  {isPrintingReport ? "Menyiapkan..." : "Cetak / Simpan PDF"}
                </Button>
              </div>
              {reportRange && <p className="mt-3 text-xs text-muted-foreground">Periode laporan: <b className="text-foreground">{reportPeriodLabel(reportRange)}</b>{isSuperAdmin && <span> · {opdId ? opdOptions.find((item) => String(item.id) === opdId)?.instansi || "OPD terpilih" : <b className="text-amber-700">Pilih satu OPD untuk mencetak</b>}</span>}</p>}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((item) => (
              <Card key={item.label} className="gap-3 overflow-hidden py-5">
                <CardContent className="flex min-w-0 items-center justify-between gap-3 px-4 sm:px-6">
                  <div className="min-w-0"><p className="text-sm text-muted-foreground">{item.label}</p>{isLoading ? <Skeleton className="mt-2 h-8 w-20" /> : <p className="mt-1 text-3xl font-bold">{formatNumber(item.value)}</p>}</div>
                  <div className={`rounded-2xl p-3 ${item.bg}`}><item.icon className={`size-6 ${item.color}`} /></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <Card>
              <CardHeader><CardTitle>Tren 30 Hari</CardTitle><CardDescription>Jumlah tamu yang mengisi Buku Tamu per hari</CardDescription></CardHeader>
              <CardContent className="px-2 sm:px-6">
                {isLoading ? <Skeleton className="h-72 w-full" /> : (
                  <ChartContainer className="h-72 w-full" config={{ total: { label: "Kunjungan", color: "#059669" } }}>
                    <AreaChart data={chartData} margin={{ left: 4, right: 4 }}>
                      <defs><linearGradient id="guestbookFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.35} /><stop offset="95%" stopColor="#059669" stopOpacity={0.02} /></linearGradient></defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <Area dataKey="total" type="monotone" stroke="#059669" strokeWidth={2.5} fill="url(#guestbookFill)" />
                    </AreaChart>
                  </ChartContainer>
                )}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-2 text-xs text-muted-foreground sm:px-0"><span><b className="text-foreground">{formatNumber(totals.internal_total)}</b> ASN Konsel</span><span><b className="text-foreground">{formatNumber(totals.external_total)}</b> ASN / Non ASN</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Kunjungan Hari Ini</CardTitle><CardDescription>Delapan tamu terbaru yang tercatat hari ini</CardDescription></CardHeader>
              <CardContent className="space-y-3 px-4 sm:px-6">
                {isLoading && Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
                {!isLoading && !data?.recent.length && <div className="py-12 text-center text-sm text-muted-foreground">Belum ada kunjungan hari ini.</div>}
                {data?.recent.map((visit) => (
                  <div key={visit.id} className="flex min-w-0 items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{visit.visitor_name}</p><p className="truncate text-xs text-muted-foreground">{visit.origin_institution || visitorTypeLabel[visit.visitor_type]}</p><p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(visit.checked_in_at)}</p></div>
                    <span className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium text-muted-foreground">{visitorTypeLabel[visit.visitor_type]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </BaseLayout>
    </AuthGuard>
  )
}

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AuthGuard } from "@/components/auth-guard"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getProfile } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import api from "@/lib/api"
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, RefreshCw, RotateCcw, Search } from "lucide-react"
import { toast } from "sonner"
import { OpdScopeSelect } from "../components/opd-scope-select"
import { SearchableSelect } from "../components/searchable-select"
import { apiErrorMessage, formatDateTime, type GuestbookVisit, type OpdOption, type VisitorType, visitorTypeLabel } from "../types"

interface VisitResponse {
  data: GuestbookVisit[]
  total: number
  total_pages: number
}

function makassarToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Makassar",
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

const today = makassarToday()

export default function GuestbookMonitoringPage() {
  const profile = getProfile()
  const isSuperAdmin = Number(profile?.menu_klp) === 1
  const canUpdate = hasPermission("guestbook_monitoring", "update")
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [opdId, setOpdId] = useState("")
  const [visitorType, setVisitorType] = useState("all")
  const [status, setStatus] = useState("all")
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [selected, setSelected] = useState<GuestbookVisit | null>(null)

  const { data: opdOptions = [] } = useQuery({
    queryKey: ["guestbook-opd-options"],
    queryFn: async () => {
      const response = await api.get("/api/v1/pegawai/instansi")
      return (response.data?.data || []) as OpdOption[]
    },
    enabled: isSuperAdmin,
    staleTime: 10 * 60 * 1000,
  })

  const visitsQuery = useQuery({
    queryKey: ["guestbook-visits", page, activeSearch, opdId, visitorType, status, dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get("/api/v1/guestbook/visits", {
        params: {
          page,
          limit: 15,
          search: activeSearch || undefined,
          opd_id: opdId || undefined,
          visitor_type: visitorType === "all" ? undefined : visitorType,
          status: status === "all" ? undefined : status,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      })
      return response.data as VisitResponse
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, nextStatus }: { id: number; nextStatus: "checked_in" | "completed" }) => {
      await api.put(`/api/v1/guestbook/visits/${id}/status`, { status: nextStatus })
    },
    onSuccess: (_, variables) => {
      toast.success(variables.nextStatus === "completed" ? "Kunjungan ditandai selesai" : "Kunjungan diaktifkan kembali")
      queryClient.invalidateQueries({ queryKey: ["guestbook-visits"] })
      queryClient.invalidateQueries({ queryKey: ["guestbook-summary"] })
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, "Gagal mengubah status kunjungan")),
  })

  const resetFilters = () => {
    setSearch("")
    setActiveSearch("")
    setVisitorType("all")
    setStatus("all")
    setDateFrom(today)
    setDateTo(today)
    setOpdId("")
    setPage(1)
  }

  return (
    <AuthGuard>
      <BaseLayout title="Monitoring Tamu" description="Pantau kedatangan, identitas, urusan, dan status tamu pada OPD">
        <div className="min-w-0 space-y-4 px-3 sm:space-y-5 sm:px-4 lg:px-6">
          <Card className="py-4">
            <CardContent className="space-y-4 px-4 sm:px-6">
              <form className="flex flex-col gap-3 lg:flex-row lg:items-end" onSubmit={(event) => { event.preventDefault(); setPage(1); setActiveSearch(search.trim()) }}>
                <label className="grid flex-1 gap-1.5 text-sm"><span className="font-medium text-muted-foreground">Cari tamu</span><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Nama, NIP, instansi, atau urusan..." /></div></label>
                {isSuperAdmin && <OpdScopeSelect value={opdId} options={opdOptions} onChange={(value) => { setOpdId(value); setPage(1) }} />}
                <div className="grid grid-cols-2 gap-2 lg:flex">
                  <Button type="submit" className="w-full"><Search className="mr-2 size-4" />Cari</Button>
                  <Button type="button" className="w-full" variant="outline" onClick={resetFilters}><RotateCcw className="mr-2 size-4" />Reset</Button>
                </div>
              </form>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1.5"><span className="text-xs font-medium text-muted-foreground">Jenis Tamu</span><SearchableSelect value={visitorType} onValueChange={(value) => { setVisitorType(value); setPage(1) }} searchPlaceholder="Cari jenis tamu..." options={[{ value: "all", label: "Semua jenis" }, { value: "internal", label: "ASN Konsel" }, { value: "external_employee", label: "ASN" }, { value: "external_general", label: "Non ASN / Tamu Umum" }]} /></label>
                <label className="grid gap-1.5"><span className="text-xs font-medium text-muted-foreground">Status</span><SearchableSelect value={status} onValueChange={(value) => { setStatus(value); setPage(1) }} searchPlaceholder="Cari status..." options={[{ value: "all", label: "Semua status" }, { value: "checked_in", label: "Sedang berkunjung" }, { value: "completed", label: "Selesai" }]} /></label>
                <label className="grid gap-1.5"><span className="text-xs font-medium text-muted-foreground">Dari tanggal</span><Input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} /></label>
                <label className="grid gap-1.5"><span className="text-xs font-medium text-muted-foreground">Sampai tanggal</span><Input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} /></label>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 py-4">
            <CardContent className="px-4 sm:px-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Daftar Kunjungan</p><p className="text-sm text-muted-foreground">{visitsQuery.data?.total || 0} data ditemukan</p></div><Button className="w-full sm:w-auto" variant="outline" size="sm" onClick={() => visitsQuery.refetch()} disabled={visitsQuery.isFetching}><RefreshCw className={`mr-2 size-4 ${visitsQuery.isFetching ? "animate-spin" : ""}`} />Muat ulang</Button></div>

              <div className="space-y-3 md:hidden">
                {visitsQuery.isLoading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-44 w-full rounded-xl" />)}
                {!visitsQuery.isLoading && !visitsQuery.data?.data.length && <div className="rounded-xl border px-4 py-12 text-center text-sm text-muted-foreground">Belum ada tamu pada filter ini.</div>}
                {visitsQuery.data?.data.map((visit) => (
                  <article key={visit.id} className="min-w-0 rounded-xl border bg-card p-4 shadow-xs">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0"><p className="break-words font-semibold">{visit.visitor_name}</p><p className="mt-0.5 break-all text-xs text-muted-foreground">{visitorTypeLabel[visit.visitor_type as VisitorType]}{visit.nip ? ` · ${visit.nip}` : ""}</p></div>
                      <Badge className="shrink-0" variant={visit.status === "completed" ? "secondary" : "default"}>{visit.status === "completed" ? "Selesai" : "Aktif"}</Badge>
                    </div>
                    <p className="mt-3 text-xs font-medium text-emerald-700">{formatDateTime(visit.checked_in_at)}</p>
                    <div className="mt-3 grid gap-2 text-sm">
                      <div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Asal / Instansi</p><p className="break-words">{visit.origin_institution || visit.office_name || "-"}</p></div>
                      <div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Urusan</p><p className="line-clamp-3 break-words">{visit.purpose}</p></div>
                      {isSuperAdmin && <div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">OPD Tujuan</p><p className="break-words">{visit.opd_name}</p></div>}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3">
                      <Button className={canUpdate ? "" : "col-span-2"} size="sm" variant="outline" onClick={() => setSelected(visit)}><Eye className="mr-2 size-4" />Detail</Button>
                      {canUpdate && <Button size="sm" variant="outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: visit.id, nextStatus: visit.status === "completed" ? "checked_in" : "completed" })}>{visit.status === "completed" ? <RefreshCw className="mr-2 size-4" /> : <CheckCircle2 className="mr-2 size-4 text-emerald-600" />}{visit.status === "completed" ? "Aktifkan" : "Selesaikan"}</Button>}
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-lg border md:block">
                <Table className="min-w-[900px]">
                  <TableHeader><TableRow><TableHead>Waktu</TableHead><TableHead>Tamu</TableHead><TableHead>Asal / Instansi</TableHead><TableHead>Urusan</TableHead>{isSuperAdmin && <TableHead>OPD Tujuan</TableHead>}<TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {visitsQuery.isLoading && Array.from({ length: 6 }).map((_, index) => <TableRow key={index}><TableCell colSpan={isSuperAdmin ? 7 : 6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)}
                    {!visitsQuery.isLoading && !visitsQuery.data?.data.length && <TableRow><TableCell colSpan={isSuperAdmin ? 7 : 6} className="h-32 text-center text-muted-foreground">Belum ada tamu pada filter ini.</TableCell></TableRow>}
                    {visitsQuery.data?.data.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="whitespace-nowrap text-xs">{formatDateTime(visit.checked_in_at)}</TableCell>
                        <TableCell><p className="font-medium">{visit.visitor_name}</p><p className="text-xs text-muted-foreground">{visitorTypeLabel[visit.visitor_type as VisitorType]}{visit.nip ? ` · ${visit.nip}` : ""}</p></TableCell>
                        <TableCell className="max-w-52"><p className="truncate text-sm">{visit.origin_institution || visit.office_name || "-"}</p><p className="truncate text-xs text-muted-foreground">{visit.position_name || "-"}</p></TableCell>
                        <TableCell className="max-w-64"><p className="line-clamp-2 text-sm">{visit.purpose}</p></TableCell>
                        {isSuperAdmin && <TableCell className="max-w-52 text-xs">{visit.opd_name}</TableCell>}
                        <TableCell><Badge variant={visit.status === "completed" ? "secondary" : "default"}>{visit.status === "completed" ? "Selesai" : "Aktif"}</Badge></TableCell>
                        <TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" title="Lihat detail" onClick={() => setSelected(visit)}><Eye className="size-4" /></Button>{canUpdate && <Button size="icon" variant="ghost" title={visit.status === "completed" ? "Aktifkan kembali" : "Tandai selesai"} disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: visit.id, nextStatus: visit.status === "completed" ? "checked_in" : "completed" })}>{visit.status === "completed" ? <RefreshCw className="size-4" /> : <CheckCircle2 className="size-4 text-emerald-600" />}</Button>}</div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-center text-muted-foreground sm:text-left">Halaman {page} dari {visitsQuery.data?.total_pages || 1}</span><div className="grid grid-cols-2 gap-2"><Button className="w-full" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" />Sebelumnya</Button><Button className="w-full" variant="outline" size="sm" disabled={page >= (visitsQuery.data?.total_pages || 1)} onClick={() => setPage((value) => value + 1)}>Berikutnya<ChevronRight className="size-4" /></Button></div></div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-xl overflow-y-auto p-4 sm:p-6"><DialogHeader><DialogTitle>Detail Kunjungan</DialogTitle><DialogDescription>Data yang diisi tamu saat melakukan check-in.</DialogDescription></DialogHeader>{selected && <div className="grid gap-4 text-sm sm:grid-cols-2"><Detail label="Nama" value={selected.visitor_name} /><Detail label="Jenis Tamu" value={visitorTypeLabel[selected.visitor_type]} /><Detail label="NIP" value={selected.nip} /><Detail label="Jenis Kelamin" value={selected.gender === "L" ? "Laki-laki" : selected.gender === "P" ? "Perempuan" : "-"} /><Detail label="Instansi / Kantor" value={selected.origin_institution || selected.office_name} /><Detail label="Jabatan" value={selected.position_name} /><Detail label="Nomor HP" value={selected.phone} /><Detail label="Waktu Datang" value={formatDateTime(selected.checked_in_at)} /><Detail label="OPD Tujuan" value={selected.opd_name} /><div className="sm:col-span-2"><Detail label="Urusan" value={selected.purpose} /></div></div>}</DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="min-w-0"><Label className="text-xs text-muted-foreground">{label}</Label><p className="mt-1 whitespace-pre-wrap break-words rounded-md bg-muted/60 px-3 py-2">{value || "-"}</p></div>
}

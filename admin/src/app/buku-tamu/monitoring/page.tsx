import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AuthGuard } from "@/components/auth-guard"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { getProfile } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import api from "@/lib/api"
import { ChevronLeft, ChevronRight, Eye, Loader2, Pencil, RefreshCw, RotateCcw, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { OpdScopeSelect } from "../components/opd-scope-select"
import { SearchableSelect } from "../components/searchable-select"
import { apiErrorMessage, formatDateTime, type GuestbookVisit, type OpdOption, type VisitorType, visitorTypeLabel } from "../types"

interface VisitResponse {
  data: GuestbookVisit[]
  total: number
  total_pages: number
}

interface EditVisitForm {
  visitor_name: string
  gender: string
  nip: string
  institution: string
  position: string
  phone: string
  purpose: string
}

const emptyEditForm: EditVisitForm = {
  visitor_name: "",
  gender: "",
  nip: "",
  institution: "",
  position: "",
  phone: "",
  purpose: "",
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
  const canDelete = hasPermission("guestbook_monitoring", "delete")
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [opdId, setOpdId] = useState("")
  const [visitorType, setVisitorType] = useState("all")
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [selected, setSelected] = useState<GuestbookVisit | null>(null)
  const [editTarget, setEditTarget] = useState<GuestbookVisit | null>(null)
  const [editForm, setEditForm] = useState<EditVisitForm>(emptyEditForm)
  const [deleteTarget, setDeleteTarget] = useState<GuestbookVisit | null>(null)

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
    queryKey: ["guestbook-visits", page, activeSearch, opdId, visitorType, dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get("/api/v1/guestbook/visits", {
        params: {
          page,
          limit: 15,
          search: activeSearch || undefined,
          opd_id: opdId || undefined,
          visitor_type: visitorType === "all" ? undefined : visitorType,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      })
      return response.data as VisitResponse
    },
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, form }: { id: number; form: EditVisitForm }) => {
      await api.put(`/api/v1/guestbook/visits/${id}`, form)
    },
    onSuccess: () => {
      toast.success("Data kunjungan berhasil diperbarui")
      setEditTarget(null)
      setSelected(null)
      queryClient.invalidateQueries({ queryKey: ["guestbook-visits"] })
      queryClient.invalidateQueries({ queryKey: ["guestbook-summary"] })
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, "Gagal memperbarui data kunjungan")),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/v1/guestbook/visits/${id}`)
    },
    onSuccess: () => {
      toast.success("Data kunjungan berhasil dihapus")
      if ((visitsQuery.data?.data.length || 0) === 1 && page > 1) setPage((value) => value - 1)
      setDeleteTarget(null)
      setSelected(null)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ["guestbook-visits"] })
      queryClient.invalidateQueries({ queryKey: ["guestbook-summary"] })
    },
    onError: (error: unknown) => toast.error(apiErrorMessage(error, "Gagal menghapus data kunjungan")),
  })

  const resetFilters = () => {
    setSearch("")
    setActiveSearch("")
    setVisitorType("all")
    setDateFrom(today)
    setDateTo(today)
    setOpdId("")
    setPage(1)
  }

  const openEdit = (visit: GuestbookVisit) => {
    setEditTarget(visit)
    setEditForm({
      visitor_name: visit.visitor_name || "",
      gender: visit.gender || "",
      nip: visit.nip || "",
      institution: visit.origin_institution || visit.office_name || "",
      position: visit.position_name || "",
      phone: visit.phone || "",
      purpose: visit.purpose || "",
    })
    editMutation.reset()
  }

  const submitEdit = (event: React.FormEvent) => {
    event.preventDefault()
    if (editTarget) editMutation.mutate({ id: editTarget.id, form: editForm })
  }

  const actionButtons = (visit: GuestbookVisit, mobile = false) => (
    <div className={mobile ? "flex flex-wrap gap-2 border-t pt-3" : "flex justify-end gap-1"}>
      <Button className={mobile ? "min-w-24 flex-1" : ""} size={mobile ? "sm" : "icon"} variant="outline" title="Lihat detail" onClick={() => setSelected(visit)}>
        <Eye className={mobile ? "mr-2 size-4" : "size-4"} />{mobile && "Detail"}
      </Button>
      {canUpdate && (
        <Button className={mobile ? "min-w-24 flex-1" : ""} size={mobile ? "sm" : "icon"} variant="outline" title="Edit kunjungan" onClick={() => openEdit(visit)}>
          <Pencil className={mobile ? "mr-2 size-4" : "size-4"} />{mobile && "Edit"}
        </Button>
      )}
      {canDelete && (
        <Button className={mobile ? "min-w-24 flex-1" : "text-destructive hover:text-destructive"} size={mobile ? "sm" : "icon"} variant="outline" title="Hapus kunjungan" onClick={() => setDeleteTarget(visit)}>
          <Trash2 className={mobile ? "mr-2 size-4" : "size-4"} />{mobile && "Hapus"}
        </Button>
      )}
    </div>
  )

  return (
    <AuthGuard>
      <BaseLayout title="Monitoring Tamu" description="Pantau dan koreksi data kunjungan tamu pada OPD">
        <div className="min-w-0 space-y-4 px-3 sm:space-y-5 sm:px-4 lg:px-6">
          <Card className="min-w-0 py-4">
            <CardContent className="min-w-0 space-y-4 px-4 sm:px-6">
              <form className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); setPage(1); setActiveSearch(search.trim()) }}>
                <label className="grid min-w-0 gap-1.5 text-sm">
                  <span className="font-medium text-muted-foreground">Cari tamu</span>
                  <div className="relative min-w-0"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 pl-9" placeholder="Nama, NIP, instansi, atau urusan..." /></div>
                </label>
                <div className="grid min-w-0 grid-cols-2 gap-2">
                  <Button type="submit" className="min-w-0"><Search className="mr-2 size-4" />Cari</Button>
                  <Button type="button" className="min-w-0" variant="outline" title="Kembalikan filter ke tanggal hari ini" onClick={resetFilters}><RotateCcw className="mr-2 size-4" /><span className="hidden sm:inline">Bersihkan </span>Filter</Button>
                </div>
              </form>
              <div className={`grid min-w-0 gap-3 sm:grid-cols-2 ${isSuperAdmin ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
                {isSuperAdmin && <OpdScopeSelect value={opdId} options={opdOptions} onChange={(value) => { setOpdId(value); setPage(1) }} />}
                <label className="grid min-w-0 gap-1.5"><span className="text-xs font-medium text-muted-foreground">Jenis Tamu</span><SearchableSelect value={visitorType} onValueChange={(value) => { setVisitorType(value); setPage(1) }} searchPlaceholder="Cari jenis tamu..." options={[{ value: "all", label: "Semua jenis" }, { value: "internal", label: "ASN Konsel" }, { value: "external_employee", label: "ASN" }, { value: "external_general", label: "Non ASN / Tamu Umum" }]} /></label>
                <label className="grid min-w-0 gap-1.5"><span className="text-xs font-medium text-muted-foreground">Dari tanggal</span><Input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} /></label>
                <label className="grid min-w-0 gap-1.5"><span className="text-xs font-medium text-muted-foreground">Sampai tanggal</span><Input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} /></label>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 gap-4 py-4">
            <CardContent className="min-w-0 px-4 sm:px-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Daftar Kunjungan</p><p className="text-sm text-muted-foreground">{visitsQuery.data?.total || 0} data ditemukan</p></div><Button className="w-full sm:w-auto" variant="outline" size="sm" onClick={() => visitsQuery.refetch()} disabled={visitsQuery.isFetching}><RefreshCw className={`mr-2 size-4 ${visitsQuery.isFetching ? "animate-spin" : ""}`} />Muat ulang</Button></div>

              <div className="space-y-3 md:hidden">
                {visitsQuery.isLoading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-44 w-full rounded-xl" />)}
                {!visitsQuery.isLoading && !visitsQuery.data?.data.length && <div className="rounded-xl border px-4 py-12 text-center text-sm text-muted-foreground">Belum ada tamu pada filter ini.</div>}
                {visitsQuery.data?.data.map((visit) => (
                  <article key={visit.id} className="min-w-0 rounded-xl border bg-card p-4 shadow-xs">
                    <div className="min-w-0"><p className="break-words font-semibold">{visit.visitor_name}</p><p className="mt-0.5 break-all text-xs text-muted-foreground">{visitorTypeLabel[visit.visitor_type as VisitorType]}{visit.nip ? ` · ${visit.nip}` : ""}</p></div>
                    <p className="mt-3 text-xs font-medium text-emerald-700">{formatDateTime(visit.checked_in_at)}</p>
                    <div className="my-3 grid gap-2 text-sm">
                      <div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Asal / Instansi</p><p className="break-words">{visit.origin_institution || visit.office_name || "-"}</p></div>
                      <div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Urusan</p><p className="line-clamp-3 break-words">{visit.purpose}</p></div>
                      {isSuperAdmin && <div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">OPD Tujuan</p><p className="break-words">{visit.opd_name}</p></div>}
                    </div>
                    {actionButtons(visit, true)}
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-lg border md:block">
                <Table className="min-w-[820px]">
                  <TableHeader><TableRow><TableHead>Waktu</TableHead><TableHead>Tamu</TableHead><TableHead>Asal / Instansi</TableHead><TableHead>Urusan</TableHead>{isSuperAdmin && <TableHead>OPD Tujuan</TableHead>}<TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {visitsQuery.isLoading && Array.from({ length: 6 }).map((_, index) => <TableRow key={index}><TableCell colSpan={isSuperAdmin ? 6 : 5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)}
                    {!visitsQuery.isLoading && !visitsQuery.data?.data.length && <TableRow><TableCell colSpan={isSuperAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground">Belum ada tamu pada filter ini.</TableCell></TableRow>}
                    {visitsQuery.data?.data.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="whitespace-nowrap text-xs">{formatDateTime(visit.checked_in_at)}</TableCell>
                        <TableCell><p className="font-medium">{visit.visitor_name}</p><p className="text-xs text-muted-foreground">{visitorTypeLabel[visit.visitor_type as VisitorType]}{visit.nip ? ` · ${visit.nip}` : ""}</p></TableCell>
                        <TableCell className="max-w-52"><p className="truncate text-sm">{visit.origin_institution || visit.office_name || "-"}</p><p className="truncate text-xs text-muted-foreground">{visit.position_name || "-"}</p></TableCell>
                        <TableCell className="max-w-64"><p className="line-clamp-2 text-sm">{visit.purpose}</p></TableCell>
                        {isSuperAdmin && <TableCell className="max-w-52 text-xs">{visit.opd_name}</TableCell>}
                        <TableCell>{actionButtons(visit)}</TableCell>
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
          <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-xl overflow-y-auto p-4 sm:p-6">
            <DialogHeader><DialogTitle>Detail Kunjungan</DialogTitle><DialogDescription>Data yang diisi tamu saat melakukan check-in.</DialogDescription></DialogHeader>
            {selected && <div className="grid gap-4 text-sm sm:grid-cols-2"><Detail label="Nama" value={selected.visitor_name} /><Detail label="Jenis Tamu" value={visitorTypeLabel[selected.visitor_type]} />{selected.nip && <Detail label="NIP" value={selected.nip} />}<Detail label="Jenis Kelamin" value={selected.gender === "L" ? "Laki-laki" : selected.gender === "P" ? "Perempuan" : "-"} /><Detail label="Instansi / Kantor" value={selected.origin_institution || selected.office_name} /><Detail label="Jabatan" value={selected.position_name} /><Detail label="Nomor HP" value={selected.phone} /><Detail label="Waktu Datang" value={formatDateTime(selected.checked_in_at)} />{isSuperAdmin && <Detail label="OPD Tujuan" value={selected.opd_name} />}<div className="sm:col-span-2"><Detail label="Urusan" value={selected.purpose} /></div></div>}
            {selected && (canUpdate || canDelete) && <DialogFooter className="pt-2">{canUpdate && <Button variant="outline" onClick={() => { setSelected(null); openEdit(selected) }}><Pencil className="mr-2 size-4" />Edit</Button>}{canDelete && <Button variant="destructive" onClick={() => { setSelected(null); setDeleteTarget(selected) }}><Trash2 className="mr-2 size-4" />Hapus</Button>}</DialogFooter>}
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(editTarget)} onOpenChange={(open) => { if (!open && !editMutation.isPending) setEditTarget(null) }}>
          <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-2xl overflow-y-auto p-4 sm:p-6">
            <DialogHeader><DialogTitle>Edit Data Kunjungan</DialogTitle><DialogDescription>Perbaiki data yang salah ketik. Waktu kunjungan dan OPD tujuan tetap dipertahankan.</DialogDescription></DialogHeader>
            {editTarget && (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitEdit}>
                <EditField label="Nama" required><Input value={editForm.visitor_name} onChange={(event) => setEditForm((current) => ({ ...current, visitor_name: event.target.value }))} minLength={3} maxLength={200} required /></EditField>
                <div className="grid gap-1.5"><Label>Jenis Tamu</Label><div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm">{visitorTypeLabel[editTarget.visitor_type]}</div></div>
                {editTarget.visitor_type === "internal" && <EditField label="NIP"><Input value={editForm.nip} onChange={(event) => setEditForm((current) => ({ ...current, nip: event.target.value }))} maxLength={40} /></EditField>}
                <div className="grid gap-1.5"><Label>Jenis Kelamin{editTarget.visitor_type !== "internal" && <span className="text-destructive"> *</span>}</Label><SearchableSelect value={editForm.gender} onValueChange={(value) => setEditForm((current) => ({ ...current, gender: value }))} searchPlaceholder="Cari jenis kelamin..." options={[{ value: "", label: "Tidak tercatat" }, { value: "L", label: "Laki-laki" }, { value: "P", label: "Perempuan" }]} /></div>
                <EditField label="Asal / Instansi" required={editTarget.visitor_type !== "internal"}><Input value={editForm.institution} onChange={(event) => setEditForm((current) => ({ ...current, institution: event.target.value }))} maxLength={255} required={editTarget.visitor_type !== "internal"} /></EditField>
                <EditField label="Jabatan / Pekerjaan" required={editTarget.visitor_type !== "internal"}><Input value={editForm.position} onChange={(event) => setEditForm((current) => ({ ...current, position: event.target.value }))} maxLength={180} required={editTarget.visitor_type !== "internal"} /></EditField>
                <EditField label="Nomor HP" required={editTarget.visitor_type !== "internal"}><Input type="tel" inputMode="tel" value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} maxLength={30} required={editTarget.visitor_type !== "internal"} /></EditField>
                <div className="grid gap-1.5 sm:col-span-2"><Label>Urusan / Keperluan <span className="text-destructive">*</span></Label><Textarea className="min-h-24 resize-none" value={editForm.purpose} onChange={(event) => setEditForm((current) => ({ ...current, purpose: event.target.value }))} minLength={3} maxLength={1000} required /></div>
                <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={editMutation.isPending}>Batal</Button><Button type="submit" disabled={editMutation.isPending}>{editMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Simpan Perubahan</Button></DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setDeleteTarget(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Hapus Data Kunjungan?</DialogTitle><DialogDescription>Data kunjungan <b className="text-foreground">{deleteTarget?.visitor_name}</b> akan dihapus permanen dan tidak muncul lagi pada rekap maupun laporan.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Batal</Button><Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}Hapus Permanen</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="min-w-0"><Label className="text-xs text-muted-foreground">{label}</Label><p className="mt-1 whitespace-pre-wrap break-words rounded-md bg-muted/60 px-3 py-2">{value || "-"}</p></div>
}

function EditField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-1.5"><Label>{label}{required && <span className="text-destructive"> *</span>}</Label>{children}</label>
}

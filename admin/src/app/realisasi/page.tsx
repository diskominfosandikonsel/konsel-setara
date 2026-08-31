"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Award,
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

import { getProfile } from "@/lib/auth"
import { Building2, Lock } from "lucide-react"

interface RealisasiItem {
  id: string
  tahun: number
  nama_program: string
  realisasi_anggaran: number
  volume: number
  satuan: string
  opd?: string
  createdBy?: string
  creatorName?: string
  createdAt: string
}

const QUICK_UNITS = ["Siswa", "Mahasiswa", "Ton", "Kg", "Stel", "Paket", "Unit", "Kelompok", "Hektar", "Orang"]

function formatRupiah(val: number | string): string {
  const num = Number(val) || 0
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num)
}

function formatNumber(val: number | string): string {
  const num = Number(val) || 0
  return new Intl.NumberFormat("id-ID").format(num)
}

export default function RealisasiPage() {
  const queryClient = useQueryClient()
  const currentYear = new Date().getFullYear()
  const profile = getProfile()
  const userRole = Number(profile?.menu_klp) // 1 = Super Admin, 2 = Admin OPD
  const userOpd = profile?.opd || ""

  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [page, setPage] = useState(1)

  // Modal Dialog states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RealisasiItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [form, setForm] = useState({
    tahun: currentYear,
    nama_program: "",
    realisasi_anggaran: 0,
    volume: 0,
    satuan: "Siswa",
    opd: userOpd,
  })

  // Permission check helper: Can current user edit/delete this item?
  const canModify = (item: RealisasiItem) => {
    if (userRole === 1) return true // Super Admin can edit all
    if (!item.opd) return true // Legacy
    return item.opd.trim().toLowerCase() === userOpd.trim().toLowerCase()
  }

  // Fetch Available Years
  const { data: yearsData } = useQuery({
    queryKey: ["realisasi-years"],
    queryFn: async () => {
      const res = await api.get("/api/v1/realisasi/years")
      return (res.data?.years || [2026, 2025]) as number[]
    },
    staleTime: 1000 * 60 * 5,
  })

  // Fetch Summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["realisasi-summary", selectedYear],
    queryFn: async () => {
      const params = selectedYear !== "all" ? `?tahun=${selectedYear}` : ""
      const res = await api.get(`/api/v1/realisasi/summary${params}`)
      return res.data as { total_program: number; total_realisasi: number }
    },
    staleTime: 1000 * 60 * 3,
  })

  // Fetch Realisasi List
  const {
    data: listData,
    isLoading: listLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["realisasi-list", selectedYear, page, activeSearch],
    queryFn: async () => {
      const payload: any = {
        data_ke: page,
        page_limit: 10,
        cari_value: activeSearch,
      }
      if (selectedYear !== "all") {
        payload.tahun = Number(selectedYear)
      }
      const res = await api.post("/api/v1/realisasi/view", payload)
      return {
        data: (res.data?.data || []) as RealisasiItem[],
        jml_data: res.data?.jml_data || 1,
        total: res.data?.total || 0,
      }
    },
    staleTime: 1000 * 60 * 3,
  })

  const items = listData?.data || []
  const totalPages = listData?.jml_data || 1
  const totalCount = listData?.total || 0
  const summary = summaryData || { total_program: 0, total_realisasi: 0 }

  const openAdd = () => {
    setEditingItem(null)
    setForm({
      tahun: selectedYear !== "all" ? Number(selectedYear) : currentYear,
      nama_program: "",
      realisasi_anggaran: 0,
      volume: 0,
      satuan: "Siswa",
      opd: userOpd,
    })
    setModalOpen(true)
  }

  const openEdit = (item: RealisasiItem) => {
    setEditingItem(item)
    setForm({
      tahun: item.tahun,
      nama_program: item.nama_program,
      realisasi_anggaran: Number(item.realisasi_anggaran),
      volume: Number(item.volume),
      satuan: item.satuan || "Paket",
      opd: item.opd || userOpd,
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama_program.trim()) {
      toast.error("Nama program wajib diisi")
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await api.post("/api/v1/realisasi/edit", {
          id: editingItem.id,
          ...form,
        })
        toast.success("Data program berhasil diperbarui")
      } else {
        await api.post("/api/v1/realisasi/add", form)
        toast.success("Program prioritas baru berhasil ditambahkan")
      }
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ["realisasi-list"] })
      queryClient.invalidateQueries({ queryKey: ["realisasi-summary"] })
      queryClient.invalidateQueries({ queryKey: ["realisasi-years"] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan data")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus program "${name}"?`)) return
    try {
      await api.post("/api/v1/realisasi/remove", { id })
      toast.success("Program berhasil dihapus")
      queryClient.invalidateQueries({ queryKey: ["realisasi-list"] })
      queryClient.invalidateQueries({ queryKey: ["realisasi-summary"] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus program")
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setActiveSearch(search)
  }

  return (
    <AuthGuard>
      <BaseLayout
        title="Realisasi Setara"
        description="Data capaian Program Prioritas Bupati (Tahun, Nama Program, Realisasi Anggaran, dan Volume/Satuan)"
      >
        <div className="px-4 lg:px-6 space-y-6">
          {/* Header Controls & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter Tahun:</span>
              </div>
              <Select value={selectedYear} onValueChange={(val) => { setSelectedYear(val); setPage(1); }}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {(yearsData || [2026, 2025]).map((yr) => (
                    <SelectItem key={yr} value={yr.toString()}>
                      Tahun {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 sm:w-72">
                <Input
                  placeholder="Cari nama program..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button type="submit" size="sm" variant="outline" className="h-9 px-3">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={openAdd} className="h-9 px-3 shrink-0">
                <Plus className="h-4 w-4 mr-1.5" /> Tambah Program
              </Button>
            </div>
          </div>

          {/* Simple KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Jumlah Program
                </CardTitle>
                <Award className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaryLoading ? <Skeleton className="h-8 w-16" /> : `${summary.total_program} Program`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedYear !== "all" ? `Tahun Anggaran ${selectedYear}` : "Semua Tahun"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Realisasi Anggaran
                </CardTitle>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {summaryLoading ? <Skeleton className="h-8 w-36" /> : formatRupiah(summary.total_realisasi)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Akumulasi realisasi anggaran</p>
              </CardContent>
            </Card>
          </div>

          {/* Table Realisasi */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    Daftar Realisasi Program Prioritas
                  </CardTitle>
                  <CardDescription>
                    Rincian data program prioritas bupati per tahun
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {totalCount} Data
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border bg-card overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[80px] text-center">Tahun</TableHead>
                      <TableHead className="min-w-[260px]">Nama Program & Instansi</TableHead>
                      <TableHead className="w-[180px]">Realisasi Anggaran</TableHead>
                      <TableHead className="w-[160px]">Volume / Satuan</TableHead>
                      <TableHead className="w-[110px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48 mb-1" /><Skeleton className="h-3 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          Belum ada data program prioritas. Klik tombol <strong>Tambah Program</strong> untuk menambahkan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => {
                        const isAllowed = canModify(item)

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            {/* Tahun */}
                            <TableCell className="text-center font-mono font-medium">
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant="outline">{item.tahun}</Badge>
                                {item.tahun >= currentYear && (
                                  <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[10px] px-1 py-0 border-amber-300">
                                    * Berjalan
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            {/* Nama Program & Instansi OPD */}
                            <TableCell className="font-medium text-foreground">
                              <div className="font-semibold">{item.nama_program}</div>
                              <div className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                <span>{item.opd || "Pemerintah Kab. Konawe Selatan"}</span>
                              </div>
                              {item.tahun >= currentYear && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 italic">
                                  * Data capaian sementara tahun berjalan
                                </p>
                              )}
                            </TableCell>

                            {/* Realisasi Anggaran */}
                            <TableCell className="font-semibold text-emerald-600">
                              {formatRupiah(item.realisasi_anggaran)}
                            </TableCell>

                            {/* Volume & Satuan Dinamis */}
                            <TableCell>
                              <span className="font-semibold text-foreground">
                                {formatNumber(item.volume)}
                              </span>{" "}
                              <span className="text-muted-foreground text-xs">
                                {item.satuan}
                              </span>
                            </TableCell>

                            {/* Aksi (Terkunci jika milik OPD lain) */}
                            <TableCell className="text-right">
                              {isAllowed ? (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                    onClick={() => openEdit(item)}
                                    title="Edit Program"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(item.id, item.nama_program)}
                                    title="Hapus Program"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end items-center" title={`Program ini diinput oleh ${item.opd || "OPD lain"}`}>
                                  <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1 py-1 font-normal bg-muted/40">
                                    <Lock className="h-3 w-3" />
                                    Terkunci
                                  </Badge>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm text-muted-foreground">
                <div>
                  Menampilkan <strong className="text-foreground">{items.length > 0 ? (page - 1) * 10 + 1 : 0}</strong> -{" "}
                  <strong className="text-foreground">{Math.min(page * 10, totalCount)}</strong> dari{" "}
                  <strong className="text-foreground">{totalCount}</strong> program
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <span className="text-xs">
                    Halaman <strong className="text-foreground">{page}</strong> dari <strong className="text-foreground">{totalPages}</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Add / Edit Program */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Program Prioritas" : "Tambah Program Prioritas"}
              </DialogTitle>
              <DialogDescription>
                Masukkan data realisasi program prioritas bupati
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 py-2">
              {/* Info OPD Penanggung Jawab */}
              {userRole === 2 ? (
                <div className="p-3 bg-muted/40 rounded-lg border text-xs flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <span className="text-muted-foreground">Instansi Penanggung Jawab:</span>
                    <div className="font-semibold text-foreground">{userOpd || "Dinas Anda"}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="opd">Instansi Penanggung Jawab OPD</Label>
                  <Input
                    id="opd"
                    placeholder="Nama Dinas / Instansi OPD"
                    value={form.opd}
                    onChange={(e) => setForm({ ...form, opd: e.target.value })}
                  />
                </div>
              )}

              {/* 1. Tahun */}
              <div className="space-y-1.5">
                <Label htmlFor="tahun">1. Tahun Anggaran *</Label>
                <Input
                  id="tahun"
                  type="number"
                  placeholder="Contoh: 2025"
                  value={form.tahun}
                  onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })}
                  required
                />
              </div>

              {/* 2. Nama Program */}
              <div className="space-y-1.5">
                <Label htmlFor="nama_program">2. Nama Program *</Label>
                <Input
                  id="nama_program"
                  placeholder="Contoh: Beasiswa UKT / Bantuan Pupuk / Seragam Sekolah"
                  value={form.nama_program}
                  onChange={(e) => setForm({ ...form, nama_program: e.target.value })}
                  required
                />
              </div>

              {/* 3. Jumlah Realisasi Anggaran (Rp) */}
              <div className="space-y-1.5">
                <Label htmlFor="realisasi_anggaran">3. Jumlah Realisasi Anggaran (Rp) *</Label>
                <Input
                  id="realisasi_anggaran"
                  type="number"
                  placeholder="Contoh: 5000000000"
                  value={form.realisasi_anggaran || ""}
                  onChange={(e) => setForm({ ...form, realisasi_anggaran: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground font-medium">
                  {formatRupiah(form.realisasi_anggaran)}
                </p>
              </div>

              {/* 4. Volume & Satuan Dinamis */}
              <div className="space-y-1.5">
                <Label>4. Volume & Satuan *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      id="volume"
                      type="number"
                      step="any"
                      placeholder="Jumlah (Contoh: 1000)"
                      value={form.volume || ""}
                      onChange={(e) => setForm({ ...form, volume: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      id="satuan"
                      placeholder="Satuan (Contoh: Siswa/Ton/Stel)"
                      value={form.satuan}
                      onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Quick Unit Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[11px] text-muted-foreground mr-1">Pilihan cepat:</span>
                  {QUICK_UNITS.map((unit) => (
                    <Badge
                      key={unit}
                      variant={form.satuan === unit ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setForm({ ...form, satuan: unit })}
                    >
                      {unit}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingItem ? "Simpan Perubahan" : "Simpan Data"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

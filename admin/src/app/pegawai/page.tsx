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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Building2,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  Building,
  RefreshCw,
  Edit,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

interface InstansiItem {
  id: string
  instansi: string
}

interface UnitKerjaItem {
  id: string
  unit_kerja: string
  instansi: string
}

interface PegawaiDirectoryItem {
  egov_id: string
  username: string
  nip: string
  nama: string
  jabatan: string
  opd: string
  unit_kerja: string
  instansi_id: string
  unit_kerja_id: string
  akses_id: string | null
  role_akses: number // 0 = None, 1 = Administrator, 2 = Admin OPD
  is_active: boolean
  granted_at: string | null
}

export default function PegawaiDirectoryPage() {
  const queryClient = useQueryClient()

  // Filter States
  const [selectedInstansi, setSelectedInstansi] = useState("all")
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("all")
  const [filterAkses, setFilterAkses] = useState("all") // 'all', 'granted', 'ungranted'
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [page, setPage] = useState(1)

  // Edit Role Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [targetPegawai, setTargetPegawai] = useState<PegawaiDirectoryItem | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("2") // '1', '2', '0'
  const [savingRole, setSavingRole] = useState(false)

  // Fetch List Instansi
  const { data: instansiList } = useQuery({
    queryKey: ["simpeg-instansi"],
    queryFn: async () => {
      const res = await api.get("/api/v1/pegawai/instansi")
      return (res.data?.data || []) as InstansiItem[]
    },
    staleTime: 10 * 60 * 1000,
  })

  // Fetch List Unit Kerja (filtered by instansi if selected)
  const { data: unitKerjaList } = useQuery({
    queryKey: ["simpeg-unit-kerja", selectedInstansi],
    queryFn: async () => {
      const param = selectedInstansi !== "all" ? `?instansi_id=${selectedInstansi}` : ""
      const res = await api.get(`/api/v1/pegawai/unit_kerja${param}`)
      return (res.data?.data || []) as UnitKerjaItem[]
    },
    staleTime: 10 * 60 * 1000,
  })

  // Fetch Pegawai Directory
  const { data: directoryData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["pegawai-directory", page, selectedInstansi, selectedUnitKerja, filterAkses, activeSearch],
    queryFn: async () => {
      const res = await api.post("/api/v1/pegawai/directory", {
        page,
        limit: 15,
        instansi_id: selectedInstansi,
        unit_kerja_id: selectedUnitKerja,
        filter_akses: filterAkses,
        cari_value: activeSearch,
      })
      return {
        data: (res.data?.data || []) as PegawaiDirectoryItem[],
        total: res.data?.total || 0,
        totalPages: res.data?.totalPages || 1,
      }
    },
  })

  const pegawaiList = directoryData?.data || []
  const totalCount = directoryData?.total || 0

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setActiveSearch(search)
  }

  const openEditModal = (item: PegawaiDirectoryItem) => {
    setTargetPegawai(item)
    setSelectedRole(item.role_akses ? item.role_akses.toString() : "2")
    setEditModalOpen(true)
  }

  const handleSaveRole = async () => {
    if (!targetPegawai) return
    setSavingRole(true)
    try {
      await api.post("/api/v1/pegawai/set_role", {
        nip: targetPegawai.nip,
        nama: targetPegawai.nama,
        opd: targetPegawai.opd,
        role: Number(selectedRole),
      })
      toast.success(
        selectedRole === "0"
          ? `Hak akses untuk ${targetPegawai.nama} berhasil dicabut`
          : `Hak akses ${targetPegawai.nama} berhasil diatur ke ${
              selectedRole === "1" ? "Administrator" : "Admin OPD"
            }`
      )
      queryClient.invalidateQueries({ queryKey: ["pegawai-directory"] })
      setEditModalOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengubah hak akses")
    } finally {
      setSavingRole(false)
    }
  }

  return (
    <AuthGuard>
      <BaseLayout
        title="Manajemen Hak Akses Pegawai"
        description="Filter berdasarkan Instansi / Unit Kerja dan atur hak akses pegawai (Admin OPD atau Administrator)"
      >
        <div className="px-4 lg:px-6 space-y-6">
          {/* Filter Bar */}
          <div className="bg-card p-4 rounded-xl border shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Filter Instansi */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Instansi / Dinas / Badan:
                </label>
                <Select
                  value={selectedInstansi}
                  onValueChange={(val) => {
                    setSelectedInstansi(val)
                    setSelectedUnitKerja("all")
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Semua Instansi" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">-- Semua Instansi --</SelectItem>
                    {(instansiList || []).map((ins) => (
                      <SelectItem key={ins.id} value={ins.id} className="text-xs">
                        {ins.instansi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Unit Kerja */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  Unit Kerja / Bidang / UPTD:
                </label>
                <Select
                  value={selectedUnitKerja}
                  onValueChange={(val) => {
                    setSelectedUnitKerja(val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Semua Unit Kerja" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">-- Semua Unit Kerja --</SelectItem>
                    {(unitKerjaList || []).map((uk) => (
                      <SelectItem key={uk.id} value={uk.id} className="text-xs">
                        {uk.unit_kerja}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Status Hak Akses */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Status Hak Akses:
                </label>
                <Select
                  value={filterAkses}
                  onValueChange={(val) => {
                    setFilterAkses(val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status Hak Akses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Pegawai</SelectItem>
                    <SelectItem value="granted">Sudah Diberi Akses</SelectItem>
                    <SelectItem value="ungranted">Belum Diberi Akses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-96">
                <Input
                  placeholder="Cari Nama Pegawai atau NIP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button type="submit" size="sm" variant="outline" className="h-9 px-3">
                  <Search className="h-3.5 w-3.5" />
                </Button>
              </form>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <Badge variant="secondary" className="font-mono text-xs">
                  {totalCount} Pegawai
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Table Pegawai */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Daftar Pegawai & Hak Akses
                  </CardTitle>
                  <CardDescription>
                    Pilih pegawai lalu tentukan peran aksesnya (Admin OPD atau Administrator)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border bg-card overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="min-w-[220px]">NIP & Nama Pegawai</TableHead>
                      <TableHead className="min-w-[220px]">Instansi / Unit Kerja</TableHead>
                      <TableHead className="min-w-[160px]">Jabatan</TableHead>
                      <TableHead className="w-[180px] text-center">Hak Akses</TableHead>
                      <TableHead className="w-[120px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          <TableCell><Skeleton className="h-4 w-44 mb-1" /><Skeleton className="h-3 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-36 mt-1" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28 mx-auto rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : pegawaiList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          Tidak ada data pegawai yang sesuai dengan filter pencarian.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pegawaiList.map((item) => (
                        <TableRow key={item.egov_id} className="hover:bg-muted/30">
                          {/* Nama & NIP */}
                          <TableCell className="py-3">
                            <div className="font-semibold text-foreground text-sm">{item.nama}</div>
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              NIP: {item.nip}
                            </div>
                          </TableCell>

                          {/* Instansi & Unit Kerja */}
                          <TableCell className="py-3">
                            <div className="text-xs font-medium text-foreground">{item.opd}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Building className="h-3 w-3 shrink-0" />
                              <span>{item.unit_kerja}</span>
                            </div>
                          </TableCell>

                          {/* Jabatan */}
                          <TableCell className="py-3 text-xs text-muted-foreground">
                            {item.jabatan}
                          </TableCell>

                          {/* Status Hak Akses */}
                          <TableCell className="text-center py-3">
                            {item.role_akses === 1 ? (
                              <Badge className="bg-amber-600 hover:bg-amber-700 text-white gap-1 text-[11px]">
                                <Shield className="h-3 w-3" />
                                Administrator
                              </Badge>
                            ) : item.role_akses === 2 ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px]">
                                <ShieldCheck className="h-3 w-3" />
                                Admin OPD
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[11px]">
                                Belum Diberi Akses
                              </Badge>
                            )}
                          </TableCell>

                          {/* Aksi Button */}
                          <TableCell className="text-right py-3">
                            <Button
                              size="sm"
                              variant={item.role_akses > 0 ? "outline" : "default"}
                              className="h-8 text-xs gap-1.5"
                              onClick={() => openEditModal(item)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              {item.role_akses > 0 ? "Ubah" : "Beri Akses"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-muted-foreground">
                  Halaman {page} dari {directoryData?.totalPages || 1}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 text-xs"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(directoryData?.totalPages || 1, p + 1))}
                    disabled={page >= (directoryData?.totalPages || 1)}
                    className="h-8 text-xs"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Atur / Ubah Hak Akses */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Atur Hak Akses Pegawai
              </DialogTitle>
              <DialogDescription>
                Tentukan hak akses akun E-Gov untuk pegawai terpilih
              </DialogDescription>
            </DialogHeader>

            {targetPegawai && (
              <div className="space-y-4 py-2">
                {/* Info Pegawai */}
                <div className="p-3 bg-muted/40 rounded-lg border space-y-1 text-xs">
                  <div className="font-semibold text-sm text-foreground">{targetPegawai.nama}</div>
                  <div className="text-muted-foreground font-mono">NIP: {targetPegawai.nip}</div>
                  <div className="text-primary font-medium">{targetPegawai.opd}</div>
                  <div className="text-muted-foreground">{targetPegawai.unit_kerja}</div>
                </div>

                {/* Role Radio Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Pilih Tingkat Hak Akses:</Label>
                  <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-2">
                    {/* Option 2: Admin OPD */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                      <RadioGroupItem value="2" id="role-opd" className="mt-0.5" />
                      <div className="space-y-0.5">
                        <Label htmlFor="role-opd" className="font-semibold text-xs cursor-pointer flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="h-4 w-4" />
                          Admin OPD / Pegawai
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Hanya dapat mengakses <strong>Dashboard</strong> dan menginput <strong>Realisasi Program Bupati</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Option 1: Administrator */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                      <RadioGroupItem value="1" id="role-admin" className="mt-0.5" />
                      <div className="space-y-0.5">
                        <Label htmlFor="role-admin" className="font-semibold text-xs cursor-pointer flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                          <Shield className="h-4 w-4" />
                          Super Administrator
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Akses penuh ke seluruh menu (Survei SKM, Konten Slider/Menu, Manajemen Pegawai).
                        </p>
                      </div>
                    </div>

                    {/* Option 0: Cabut Akses */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/20 hover:bg-destructive/5 cursor-pointer">
                      <RadioGroupItem value="0" id="role-none" className="mt-0.5" />
                      <div className="space-y-0.5">
                        <Label htmlFor="role-none" className="font-semibold text-xs cursor-pointer flex items-center gap-1.5 text-destructive">
                          <UserX className="h-4 w-4" />
                          Cabut Hak Akses (Nonaktif)
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Pegawai ini tidak akan bisa login ke Admin Panel Konsel Setara.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t">
              <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={savingRole}>
                Batal
              </Button>
              <Button onClick={handleSaveRole} disabled={savingRole}>
                {savingRole ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <UserCheck className="h-4 w-4 mr-1.5" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

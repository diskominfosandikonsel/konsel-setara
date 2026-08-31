"use client"

import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

interface Aplikasi {
  id: string
  nama: string
  keterangan: string
  kategori: string
  skor: number
  responden: number
  createdAt: string
}

export default function Page() {
  const [data, setData] = useState<Aplikasi[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Aplikasi | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({ nama: "", keterangan: "", kategori: "" })

  const fetchData = async (p: number) => {
    setLoading(true)
    try {
      const res = await api.post("/api/v1/skm/viewAplikasi", {
        data_ke: p,
        page_limit: 10,
        cari_value: search,
      })
      setData(res.data.data || [])
      setTotalPages(res.data.jml_data || 1)
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(page) }, [page])

  const handleSearch = () => { setPage(1); fetchData(1) }

  const openAdd = () => {
    setEditing(null)
    setForm({ nama: "", keterangan: "", kategori: "" })
    setModalOpen(true)
  }

  const openEdit = (item: Aplikasi) => {
    setEditing(item)
    setForm({ nama: item.nama, keterangan: item.keterangan || "", kategori: item.kategori || "" })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nama.trim()) {
      toast.error("Nama layanan wajib diisi")
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await api.post("/api/v1/skm/editAplikasi", { id: editing.id, ...form })
        toast.success("Layanan berhasil diperbarui")
      } else {
        await api.post("/api/v1/skm/addAplikasi", { ...form, skor: 0, responden: 0 })
        toast.success("Layanan berhasil ditambahkan")
      }
      setModalOpen(false)
      fetchData(page)
    } catch (err) {
      toast.error("Gagal menyimpan data")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus layanan ini?")) return
    try {
      await api.post("/api/v1/skm/removeAplikasi", { id })
      toast.success("Layanan berhasil dihapus")
      fetchData(page)
    } catch (err) {
      toast.error("Gagal menghapus")
    }
  }

  return (
    <AuthGuard>
      <BaseLayout title="Aplikasi / Layanan" description="Kelola data layanan publik yang disurvei">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Daftar Layanan ({total})</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Cari layanan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="max-w-xs"
                  />
                  <Button variant="outline" size="icon" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button onClick={openAdd}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Layanan</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Responden</TableHead>
                      <TableHead className="hidden md:table-cell">Keterangan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Belum ada data layanan
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nama}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.kategori || "-"}</Badge>
                          </TableCell>
                          <TableCell>{item.skor}</TableCell>
                          <TableCell>{item.responden}</TableCell>
                          <TableCell className="hidden md:table-cell max-w-xs truncate">
                            {item.keterangan || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Layanan" : "Tambah Layanan"}</DialogTitle>
              <DialogDescription>
                {editing ? "Ubah informasi layanan" : "Masukkan data layanan baru"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama Layanan</Label>
                <Input id="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama layanan" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Input id="kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="Kategori" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea id="keterangan" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} placeholder="Keterangan layanan" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

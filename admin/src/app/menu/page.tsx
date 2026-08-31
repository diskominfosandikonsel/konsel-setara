import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Smartphone, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

interface MenuItem {
  id: string
  label: string
  icon: string
  img: string
  route: string
  urutan: number
  is_active: number
}

export default function Page() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [form, setForm] = useState({
    label: "",
    icon: "",
    img: "",
    route: "",
    urutan: 0,
    is_active: 1,
  })

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const res = await api.post("/api/v1/menu/view", {
        data_ke: 1,
        page_limit: 50,
      })
      setMenus(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error("Gagal memuat data menu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({
      label: "",
      icon: "apps",
      img: "",
      route: "",
      urutan: menus.length + 1,
      is_active: 1,
    })
    setModalOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setForm({
      label: item.label,
      icon: item.icon || "",
      img: item.img || "",
      route: item.route || "",
      urutan: item.urutan || 0,
      is_active: item.is_active,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.label.trim() || !form.route.trim()) {
      toast.error("Label dan Route wajib diisi")
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await api.post("/api/v1/menu/edit", { id: editing.id, ...form })
        toast.success("Menu berhasil diperbarui")
      } else {
        await api.post("/api/v1/menu/add", form)
        toast.success("Menu berhasil ditambahkan")
      }
      setModalOpen(false)
      fetchMenus()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan menu")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return
    try {
      await api.post("/api/v1/menu/remove", { id })
      toast.success("Menu berhasil dihapus")
      fetchMenus()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus menu")
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= menus.length) return

    const newMenus = [...menus]
    const temp = newMenus[index]
    newMenus[index] = newMenus[targetIndex]
    newMenus[targetIndex] = temp

    const orders = newMenus.map((item, idx) => ({
      id: item.id,
      urutan: idx + 1
    }))

    setMenus(newMenus)

    try {
      await api.post("/api/v1/menu/reorder", { orders })
      toast.success("Urutan menu berhasil diperbarui")
    } catch (err) {
      toast.error("Gagal mengubah urutan menu")
      fetchMenus()
    }
  }

  const activeMenus = menus.filter(m => m.is_active === 1)

  return (
    <AuthGuard>
      <BaseLayout title="Menu Dinamis Mobile" description="Kelola ikon dan menu navigasi yang tampil pada layar utama aplikasi Android">
        <div className="px-4 lg:px-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Tabel Pengaturan Menu (2 Kolom) */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Daftar Menu Grid ({menus.length})</CardTitle>
                      <CardDescription>Atur urutan, ikon, dan status aktif menu</CardDescription>
                    </div>
                    <Button onClick={openAdd}>
                      <Plus className="h-4 w-4 mr-2" /> Tambah Menu
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Urut</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>Route / Path</TableHead>
                          <TableHead>Ikon / Gambar</TableHead>
                          <TableHead>Status</TableHead>
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
                        ) : menus.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Belum ada data menu
                            </TableCell>
                          </TableRow>
                        ) : (
                          menus.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={index === 0}
                                    onClick={() => handleMove(index, 'up')}
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={index === menus.length - 1}
                                    onClick={() => handleMove(index, 'down')}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{item.label}</TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">{item.route}</TableCell>
                              <TableCell>
                                <div className="text-xs">
                                  {item.img ? (
                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-mono">{item.img}</span>
                                  ) : (
                                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-mono">{item.icon || '-'}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.is_active ? "default" : "secondary"}>
                                  {item.is_active ? "Aktif" : "Non-aktif"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
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
                </CardContent>
              </Card>
            </div>

            {/* Live Preview Android Mobile (1 Kolom) */}
            <div className="space-y-4">
              <Card className="border-2 border-primary/20 bg-muted/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-md">Live Preview Mobile</CardTitle>
                  </div>
                  <CardDescription>Simulasi tampilan grid menu di layar beranda Android</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mx-auto max-w-[280px] rounded-3xl border-4 border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl">
                    {/* Status bar mock */}
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-4 px-1">
                      <span>09:41</span>
                      <div className="flex gap-1">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Section Menu Mock */}
                    <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-3 shadow-inner">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">Menu Layanan</div>
                      <div className="grid grid-cols-4 gap-2">
                        {activeMenus.map((item) => (
                          <div key={item.id} className="flex flex-col items-center gap-1 text-center">
                            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-600 text-primary">
                              <Sparkles className="h-5 w-5 text-indigo-500" />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-tight line-clamp-1">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 text-center text-[10px] text-muted-foreground">
                      * Menu non-aktif otomatis disembunyikan
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>

        {/* Modal Add/Edit Menu */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Menu Item" : "Tambah Menu Item"}</DialogTitle>
              <DialogDescription>
                Atur label, route halaman, dan ikon untuk menu aplikasi mobile
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Label Menu</Label>
                <Input
                  id="label"
                  placeholder="Misal: SKM, Sippadu, Firetap"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="route">Route / Path Halaman</Label>
                <Input
                  id="route"
                  placeholder="Misal: skm, sippadu, sapa_dashboard"
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="img">Path Gambar Asset (Opsional)</Label>
                <Input
                  id="img"
                  placeholder="Misal: icons/skm.png"
                  value={form.img}
                  onChange={(e) => setForm({ ...form, img: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="icon">Material Icon Name (Jika tanpa gambar)</Label>
                <Input
                  id="icon"
                  placeholder="Misal: reviews, description, apps"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Status Aktif</Label>
                  <div className="text-xs text-muted-foreground">Tampilkan menu ini di aplikasi mobile</div>
                </div>
                <Switch
                  checked={form.is_active === 1}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked ? 1 : 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan Menu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

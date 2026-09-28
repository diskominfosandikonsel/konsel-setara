import { useState, useEffect, useRef } from "react"
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
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Smartphone, Loader2, Sparkles,
  UploadCloud, X, ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import api, { UPLOAD_URL } from "@/lib/api"

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
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [form, setForm] = useState({
    label: "",
    icon: "",
    img: "",
    route: "",
    urutan: 0,
    is_active: 1,
  })

  // Helper resolusi path gambar
  const getAdminImageSrc = (img: string) => {
    if (!img) return ""
    if (img.startsWith("http://") || img.startsWith("https://")) return img
    const cleanPath = img.replace(/\/+/g, "/").replace(/^\//, "")
    if (cleanPath.startsWith("uploads/")) {
      const clean = cleanPath.replace(/^uploads\//, "")
      return `${UPLOAD_URL}/${clean}`
    }
    // Aset lokal icons di admin public atau local server
    return `/${cleanPath}`
  }

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
    setImagePreview("")
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
    setImagePreview(item.img ? getAdminImageSrc(item.img) : "")
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

  // Upload Logo ke Server
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file logo maksimal 5 MB")
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("logo", file)

      const res = await api.post("/api/v1/menu/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (res.data?.success && res.data?.data?.path) {
        const uploadedPath = res.data.data.path
        setForm(prev => ({ ...prev, img: uploadedPath }))
        setImagePreview(getAdminImageSrc(uploadedPath))
        toast.success("Logo berhasil diunggah!")
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengunggah logo"
      toast.error(msg)
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveLogo = () => {
    setForm(prev => ({ ...prev, img: "" }))
    setImagePreview("")
    if (fileInputRef.current) fileInputRef.current.value = ""
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
                      <CardDescription>Atur urutan, ikon/logo, dan status aktif menu</CardDescription>
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
                          <TableHead>Ikon / Logo</TableHead>
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
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {item.label}
                                  {(item.route?.startsWith('http://') || item.route?.startsWith('https://')) && (
                                    <span title="External Link">
                                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono max-w-[140px] truncate" title={item.route}>
                                {item.route}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border p-1 shrink-0 flex items-center justify-center relative overflow-hidden">
                                    {item.img ? (
                                      <img
                                        src={getAdminImageSrc(item.img)}
                                        alt={item.label}
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none"
                                          const fallback = e.currentTarget.parentElement?.querySelector('.icon-fallback') as HTMLElement
                                          if (fallback) fallback.style.display = "flex"
                                        }}
                                      />
                                    ) : null}
                                    <div className={`icon-fallback h-full w-full items-center justify-center ${item.img ? 'hidden' : 'flex'}`}>
                                      <Sparkles className="h-4 w-4 text-amber-500" />
                                    </div>
                                  </div>
                                  <div className="text-xs">
                                    {item.img ? (
                                      <span className="text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.5 rounded text-[11px] font-mono block max-w-[150px] truncate" title={item.img}>
                                        {item.img}
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded text-[11px] font-mono">
                                        {item.icon || 'apps'}
                                      </span>
                                    )}
                                  </div>
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
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 shadow-inner border">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">Menu Layanan</div>
                      <div className="grid grid-cols-4 gap-2">
                        {activeMenus.map((item) => (
                          <div key={item.id} className="flex flex-col items-center gap-1 text-center">
                            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden p-1.5 relative">
                              {item.img ? (
                                <img
                                  src={getAdminImageSrc(item.img)}
                                  alt={item.label}
                                  className="h-full w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.parentElement?.querySelector('.preview-fallback') as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div className={`preview-fallback h-full w-full items-center justify-center ${item.img ? 'hidden' : 'flex'}`}>
                                <Sparkles className="h-5 w-5 text-indigo-500" />
                              </div>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Menu Item" : "Tambah Menu Item"}</DialogTitle>
              <DialogDescription>
                Atur label, route halaman, dan upload logo ikon untuk aplikasi mobile
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[75vh] overflow-y-auto px-1">
              <div className="grid gap-2">
                <Label htmlFor="label">Label Menu <span className="text-destructive">*</span></Label>
                <Input
                  id="label"
                  placeholder="Misal: Portal OPD, SKM, Sippadu, Firetap"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="route">Route Halaman / External URL <span className="text-destructive">*</span></Label>
                <Input
                  id="route"
                  placeholder="Misal: /rup, /skm, atau https://diskominfo.konaweselatankab.go.id"
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">
                  Gunakan path internal (misal: <code>/rup</code>) atau link eksternal web (dimulai <code>https://</code>).
                </p>
              </div>

              {/* Upload Logo File dengan Preview */}
              <div className="grid gap-2 border rounded-lg p-3 bg-muted/20">
                <Label className="text-sm font-semibold flex items-center justify-between">
                  <span>Upload Logo Gambar</span>
                  {uploadingLogo && (
                    <span className="text-xs text-primary flex items-center gap-1 font-normal">
                      <Loader2 className="h-3 w-3 animate-spin" /> Mengunggah...
                    </span>
                  )}
                </Label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />

                {imagePreview || form.img ? (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                    <div className="h-14 w-14 rounded-lg border bg-slate-50 dark:bg-slate-800 p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={imagePreview || getAdminImageSrc(form.img)}
                        alt="Logo Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono truncate text-muted-foreground" title={form.img}>
                        {form.img || "File lokal baru"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingLogo}
                        >
                          <UploadCloud className="h-3.5 w-3.5 mr-1" /> Ganti Logo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={handleRemoveLogo}
                          disabled={uploadingLogo}
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 cursor-pointer hover:border-primary/60 hover:bg-muted/40 transition-colors text-center"
                  >
                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium">Klik untuk upload file logo</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, SVG, WebP (Maks 5 MB)</span>
                  </div>
                )}

                {/* Input manual opsional jika path asset atau external link */}
                <div className="mt-2">
                  <Label htmlFor="img" className="text-[11px] text-muted-foreground">
                    Atau ketik path / URL gambar langsung:
                  </Label>
                  <Input
                    id="img"
                    className="h-8 text-xs font-mono mt-1"
                    placeholder="Misal: icons/rup.png atau https://.../logo.png"
                    value={form.img}
                    onChange={(e) => {
                      setForm({ ...form, img: e.target.value })
                      setImagePreview(e.target.value ? getAdminImageSrc(e.target.value) : "")
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="icon">Material Icon Name (Fallback jika tanpa gambar)</Label>
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
              <Button onClick={handleSave} disabled={saving || uploadingLogo}>
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

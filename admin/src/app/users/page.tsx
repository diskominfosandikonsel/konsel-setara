import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Loader2, ShieldCheck, ShieldAlert, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { getProfile } from "@/lib/auth"

interface UserAccount {
  id: string
  username: string
  nama: string
  email: string
  hp: string
  menu_klp: number
  createdAt: string
}

export default function Page() {
  const currentProfile = getProfile()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserAccount | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [form, setForm] = useState({
    username: "",
    nama: "",
    email: "",
    hp: "",
    password: "",
    menu_klp: 1,
  })

  const fetchUsers = async (p: number) => {
    setLoading(true)
    try {
      const res = await api.post("/api/v1/users/view", {
        data_ke: p,
        page_limit: 10,
        cari_value: search,
      })
      setUsers(res.data.data || [])
      setTotalPages(res.data.jml_data || 1)
      setTotal(res.data.total || 0)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "Gagal memuat data pengguna")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page)
  }, [page])

  const handleSearch = () => {
    setPage(1)
    fetchUsers(1)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({
      username: "",
      nama: "",
      email: "",
      hp: "",
      password: "",
      menu_klp: 1,
    })
    setModalOpen(true)
  }

  const openEdit = (item: UserAccount) => {
    setEditing(item)
    setForm({
      username: item.username,
      nama: item.nama,
      email: item.email || "",
      hp: item.hp || "",
      password: "",
      menu_klp: item.menu_klp || 3,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nama.trim()) {
      toast.error("Nama lengkap wajib diisi")
      return
    }
    if (!editing && (!form.username.trim() || !form.password.trim())) {
      toast.error("Username dan Password wajib diisi untuk pengguna baru")
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await api.post("/api/v1/users/edit", {
          id: editing.id,
          nama: form.nama,
          email: form.email,
          hp: form.hp,
          menu_klp: form.menu_klp,
          password: form.password || undefined,
        })
        toast.success("Data user berhasil diperbarui")
      } else {
        await api.post("/api/v1/users/add", form)
        toast.success("User admin berhasil ditambahkan")
      }
      setModalOpen(false)
      fetchUsers(page)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan user")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return
    try {
      await api.post("/api/v1/users/remove", { id })
      toast.success("Pengguna berhasil dihapus")
      fetchUsers(page)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus pengguna")
    }
  }

  const getRoleBadge = (menu_klp: number) => {
    switch (Number(menu_klp)) {
      case 1:
        return (
          <Badge className="bg-red-600 hover:bg-red-700 gap-1">
            <ShieldCheck className="h-3 w-3" /> Super Admin
          </Badge>
        )
      case 2:
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 gap-1">
            <ShieldAlert className="h-3 w-3" /> Admin OPD
          </Badge>
        )
      case 4:
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 gap-1">
            <ShieldCheck className="h-3 w-3" /> Admin CSR
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <UserIcon className="h-3 w-3" /> Pengguna
          </Badge>
        )
    }
  }

  return (
    <AuthGuard>
      <BaseLayout title="Manajemen Pengguna" description="Kelola akun administrator dan hak akses sistem Konsel Setara">
        <div className="px-4 lg:px-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Daftar Akun Pengguna ({total})</CardTitle>
                  <CardDescription>Manajemen data akun dan hak akses pengguna sistem</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Cari user / nama..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="max-w-xs"
                  />
                  <Button variant="outline" size="icon" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button onClick={openAdd}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah Admin
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Kontak / Email</TableHead>
                      <TableHead>Hak Akses (Role)</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Tidak ada data pengguna ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div>{item.nama}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{item.username}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {item.email && <div className="text-muted-foreground">{item.email}</div>}
                              {item.hp && <div className="text-muted-foreground">{item.hp}</div>}
                              {!item.email && !item.hp && <span className="text-muted-foreground italic">-</span>}
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(item.menu_klp)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                disabled={item.username === currentProfile?.username}
                                onClick={() => handleDelete(item.id)}
                              >
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Halaman {page} dari {totalPages}
                </p>
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

        {/* Modal Add / Edit User */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
              <DialogDescription>
                {editing ? "Ubah informasi akun dan hak akses pengguna" : "Buat akun administrator baru untuk sistem"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  placeholder="Nama lengkap"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Username login"
                  value={form.username}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@domain.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hp">No. HP / WA</Label>
                  <Input
                    id="hp"
                    placeholder="081234..."
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password {editing ? "(Kosongkan jika tidak ingin mengubah password)" : "(Wajib)"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Hak Akses (Role)</Label>
                <Select
                  value={String(form.menu_klp)}
                  onValueChange={(val) => setForm({ ...form, menu_klp: Number(val) })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Super Administrator (Akses Penuh)</SelectItem>
                    <SelectItem value="2">Admin OPD / Unit Layanan</SelectItem>
                    <SelectItem value="3">Pengguna Biasa (Mobile App)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan Pengguna"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

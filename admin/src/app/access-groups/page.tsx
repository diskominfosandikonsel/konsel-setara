import { useEffect, useMemo, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { KeyRound, Loader2, LockKeyhole, Pencil, Plus, Save, ShieldCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import type { AccessGroupProfile, MenuPermission, PermissionAction } from "@/lib/permissions"

interface AccessGroup extends AccessGroupProfile {
  created_at?: string
  updated_at?: string
}

const actionColumns: { key: PermissionAction; label: string }[] = [
  { key: "read", label: "Read" },
  { key: "create", label: "Add" },
  { key: "update", label: "Edit" },
  { key: "delete", label: "Delete" },
]

export default function AccessGroupsPage() {
  const [groups, setGroups] = useState<AccessGroup[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<MenuPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<AccessGroup | null>(null)
  const [form, setForm] = useState({ name: "", description: "", is_active: true })

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedId) || null,
    [groups, selectedId]
  )

  const loadGroups = async (preferredId?: number) => {
    setLoading(true)
    try {
      const response = await api.get("/api/v1/access-groups")
      const nextGroups = (response.data.data || []) as AccessGroup[]
      setGroups(nextGroups)
      const nextId = preferredId && nextGroups.some((item) => item.id === preferredId)
        ? preferredId
        : selectedId && nextGroups.some((item) => item.id === selectedId)
          ? selectedId
          : nextGroups[0]?.id ?? null
      setSelectedId(nextId)
      const current = nextGroups.find((item) => item.id === nextId)
      setDraft(current?.permissions.map((item) => ({ ...item })) || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat kelompok hak akses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  const chooseGroup = (group: AccessGroup) => {
    setSelectedId(group.id)
    setDraft(group.permissions.map((item) => ({ ...item })))
  }

  const updatePermission = (menuKey: string, action: PermissionAction, checked: boolean) => {
    setDraft((current) => current.map((permission) => {
      if (permission.key !== menuKey) return permission

      if (action === "read" && !checked) {
        return {
          ...permission,
          can_read: false,
          can_create: false,
          can_update: false,
          can_delete: false,
        }
      }

      return {
        ...permission,
        can_read: action === "read" ? checked : checked ? true : permission.can_read,
        [`can_${action}`]: checked,
      }
    }))
  }

  const savePermissions = async () => {
    if (!selectedGroup || selectedGroup.id === 1) return
    setSaving(true)
    try {
      const response = await api.put(`/api/v1/access-groups/${selectedGroup.id}/permissions`, {
        permissions: draft.map((permission) => ({
          menu_key: permission.key,
          can_read: permission.can_read,
          can_create: permission.can_create,
          can_update: permission.can_update,
          can_delete: permission.can_delete,
        })),
      })
      const updated = response.data.data as AccessGroup
      setGroups((current) => current.map((item) => item.id === updated.id ? updated : item))
      setDraft(updated.permissions.map((item) => ({ ...item })))
      toast.success("Hak akses kelompok berhasil disimpan")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan hak akses")
    } finally {
      setSaving(false)
    }
  }

  const openAdd = () => {
    setEditingGroup(null)
    setForm({ name: "", description: "", is_active: true })
    setDialogOpen(true)
  }

  const openEdit = () => {
    if (!selectedGroup || selectedGroup.is_system) return
    setEditingGroup(selectedGroup)
    setForm({
      name: selectedGroup.name,
      description: selectedGroup.description || "",
      is_active: selectedGroup.is_active,
    })
    setDialogOpen(true)
  }

  const saveGroup = async () => {
    if (form.name.trim().length < 3) {
      toast.error("Nama kelompok minimal 3 karakter")
      return
    }

    setSaving(true)
    try {
      if (editingGroup) {
        await api.put(`/api/v1/access-groups/${editingGroup.id}`, form)
        toast.success("Kelompok berhasil diperbarui")
        setDialogOpen(false)
        await loadGroups(editingGroup.id)
      } else {
        const response = await api.post("/api/v1/access-groups", form)
        toast.success("Kelompok baru berhasil ditambahkan")
        setDialogOpen(false)
        await loadGroups(Number(response.data.data.id))
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan kelompok")
    } finally {
      setSaving(false)
    }
  }

  const deleteGroup = async () => {
    if (!selectedGroup || selectedGroup.is_system) return
    if (!window.confirm(`Hapus kelompok “${selectedGroup.name}”?`)) return

    setSaving(true)
    try {
      await api.delete(`/api/v1/access-groups/${selectedGroup.id}`)
      toast.success("Kelompok berhasil dihapus")
      setSelectedId(null)
      await loadGroups()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus kelompok")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard>
      <BaseLayout
        title="Kelompok & Hak Akses"
        description="Atur menu serta izin Read, Add, Edit, dan Delete untuk setiap kelompok administrator"
      >
        <div className="grid gap-6 px-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Kelompok</CardTitle>
                  <CardDescription>Pilih kelompok yang akan diatur</CardDescription>
                </div>
                <Button size="icon" className="h-8 w-8" onClick={openAdd} title="Tambah kelompok">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              )) : groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => chooseGroup(group)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedId === group.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{group.name}</span>
                    {group.is_system && <LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={group.is_active ? "secondary" : "outline"} className="text-[10px]">
                      {group.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">ID {group.id}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <KeyRound className="h-5 w-5 text-primary" />
                    {selectedGroup?.name || "Pilih Kelompok"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedGroup?.description || "Pilih kelompok di sebelah kiri untuk mengatur akses."}
                  </CardDescription>
                </div>
                {selectedGroup && !selectedGroup.is_system && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openEdit}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Kelompok
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={deleteGroup}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedGroup ? (
                <>
                  {selectedGroup.id === 1 && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      Administrator dikunci dengan akses penuh untuk mencegah sistem kehilangan pengelola utama.
                    </div>
                  )}
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[220px]">Menu / Modul</TableHead>
                          {actionColumns.map((action) => (
                            <TableHead key={action.key} className="w-24 text-center">{action.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draft.map((permission) => {
                          const administratorOnly = permission.key === "access_groups"
                          const locked = selectedGroup.id === 1 || administratorOnly
                          return (
                            <TableRow key={permission.key}>
                              <TableCell>
                                <div className="font-medium">{permission.label}</div>
                                <div className="text-xs text-muted-foreground">{permission.section}</div>
                                {administratorOnly && selectedGroup.id !== 1 && (
                                  <div className="mt-1 text-[11px] text-amber-600">Khusus Administrator</div>
                                )}
                              </TableCell>
                              {actionColumns.map((action) => (
                                <TableCell key={action.key} className="text-center">
                                  <Checkbox
                                    aria-label={`${action.label} ${permission.label}`}
                                    checked={permission[`can_${action.key}`]}
                                    disabled={locked}
                                    onCheckedChange={(value) => updatePermission(permission.key, action.key, value === true)}
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={savePermissions} disabled={saving || selectedGroup.id === 1}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Simpan Hak Akses
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-sm text-muted-foreground">Belum ada kelompok dipilih.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Edit Kelompok" : "Tambah Kelompok"}</DialogTitle>
              <DialogDescription>
                {editingGroup ? "Perbarui identitas dan status kelompok." : "Buat kelompok baru, lalu atur izin menunya."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="group-name">Nama Kelompok</Label>
                <Input
                  id="group-name"
                  value={form.name}
                  maxLength={100}
                  placeholder="Contoh: Operator Konten"
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Deskripsi</Label>
                <Textarea
                  id="group-description"
                  value={form.description}
                  maxLength={255}
                  placeholder="Jelaskan tanggung jawab kelompok ini"
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>
              {editingGroup && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="group-active">Kelompok Aktif</Label>
                    <p className="text-xs text-muted-foreground">Kelompok nonaktif tidak dapat masuk ke panel.</p>
                  </div>
                  <Switch
                    id="group-active"
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Batal</Button>
              <Button onClick={saveGroup} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

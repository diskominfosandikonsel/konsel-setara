import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Pencil, Image as ImageIcon, ExternalLink, Loader2, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import api, { UPLOAD_URL } from "@/lib/api"

interface SliderItem {
  id: number
  img: string
  link: string
  urutan: number
  createdAt: string
}

export default function Page() {
  const [sliders, setSliders] = useState<SliderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SliderItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [link, setLink] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const fetchSliders = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/v1/slider")
      if (res.data.success) {
        setSliders(res.data.data || [])
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal memuat slider")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSliders()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setLink("")
    setImageFile(null)
    setImagePreview("")
    setModalOpen(true)
  }

  const openEdit = (item: SliderItem) => {
    setEditing(item)
    setLink(item.link || "")
    setImageFile(null)
    setImagePreview(item.img ? `${UPLOAD_URL}/${item.img}` : "")
    setModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!editing && !imageFile) {
      toast.error("File gambar wajib diunggah untuk banner baru")
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("link", link)
      if (imageFile) {
        formData.append("image", imageFile)
      }

      if (editing) {
        await api.put(`/api/v1/slider/${editing.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        toast.success("Slider berhasil diperbarui")
      } else {
        await api.post("/api/v1/slider", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        toast.success("Slider berhasil ditambahkan")
      }

      setModalOpen(false)
      fetchSliders()
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan slider"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus slider ini?")) return
    try {
      await api.delete(`/api/v1/slider/${id}`)
      toast.success("Slider berhasil dihapus")
      fetchSliders()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus slider")
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sliders.length) return

    const newSliders = [...sliders]
    const temp = newSliders[index]
    newSliders[index] = newSliders[targetIndex]
    newSliders[targetIndex] = temp

    // Set updated sequence numbers
    const orders = newSliders.map((item, idx) => ({
      id: item.id,
      urutan: idx + 1
    }))

    setSliders(newSliders)

    try {
      await api.post("/api/v1/slider/reorder", { orders })
      toast.success("Urutan slider berhasil diperbarui")
    } catch (err) {
      toast.error("Gagal mengubah urutan slider")
      fetchSliders()
    }
  }

  return (
    <AuthGuard>
      <BaseLayout title="Slider / Banner Mobile" description="Kelola banner carousel yang tampil di aplikasi Android Konsel Setara">
        <div className="px-4 lg:px-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Daftar Banner Aktif ({sliders.length})</h2>
              <p className="text-sm text-muted-foreground">Urutan di bawah ini menentukan urutan tayang pada aplikasi mobile</p>
            </div>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Banner
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-44 w-full rounded-t-lg" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sliders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Belum Ada Banner Slider</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                  Tambahkan gambar banner untuk mempercantik dan menampilkan pengumuman di aplikasi mobile.
                </p>
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4 mr-2" /> Upload Banner Baru
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sliders.map((item, index) => (
                <Card key={item.id} className="overflow-hidden group flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/9] bg-muted w-full overflow-hidden flex items-center justify-center">
                      <img
                        src={`${UPLOAD_URL}/${item.img}`}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallbackUrl = `https://konsel-setara.konaweselatankab.go.id/uploads/${item.img}`;
                          if (target.src !== fallbackUrl) {
                            target.src = fallbackUrl;
                          } else {
                            target.style.display = 'none';
                          }
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium z-10">
                        Posisi #{index + 1}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground mb-1">Target Link / Video:</div>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.link}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Tidak ada link</span>
                      )}
                    </CardContent>
                  </div>
                  <div className="p-4 pt-0 border-t flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        title="Geser ke kiri/atas"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === sliders.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        title="Geser ke kanan/bawah"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal Add / Edit Slider */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Banner Slider" : "Tambah Banner Slider"}</DialogTitle>
              <DialogDescription>
                Upload gambar banner dalam rasio landscape (misal 16:9 atau 1200x600 px).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="image">File Gambar Banner {editing ? "(Opsional jika tidak diganti)" : "(Wajib)"}</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {imagePreview && (
                <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden border bg-muted">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="link">Link Tujuan (Opsional)</Label>
                <Input
                  id="link"
                  placeholder="https://youtube.com/watch?v=... atau https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan Banner"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Plus, Trash2, Pencil, ExternalLink, Play, Search, Video,
  Loader2, RefreshCw, CheckCircle2, Film
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

interface VideoItem {
  id: number
  tiktok_id: string
  account_id: number
  author_username: string
  category: "official" | "daily"
  title: string
  video_url: string
  play_url: string | null
  cover_url: string | null
  play_count: number
  digg_count: number
  comment_count: number
  is_active: number
  posted_at: string
  created_at: string
  account_name?: string
  badge_color?: string
}

export default function Page() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "official" | "daily">("all")

  // Modal Tambah
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addUrl, setAddUrl] = useState("")
  const [addCategory, setAddCategory] = useState<"official" | "daily">("official")
  const [adding, setAdding] = useState(false)

  // Modal Edit
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState<"official" | "daily">("official")
  const [savingEdit, setSavingEdit] = useState(false)

  // Modal Preview
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null)

  // Modal Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/v1/tiktok/list", {
        params: {
          category: selectedCategory,
          search: search.trim(),
          limit: 50,
          page: 1,
        },
      })
      if (res.data.success) {
        setVideos(res.data.data || [])
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "Gagal memuat daftar video Konsel")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [selectedCategory])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVideos()
  }

  // 1. Tambah Video Baru
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addUrl.trim()) {
      toast.error("Tautan URL video TikTok wajib diisi")
      return
    }

    setAdding(true)
    try {
      const res = await api.post("/api/v1/tiktok/add", {
        videoUrl: addUrl.trim(),
        category: addCategory,
      })
      if (res.data.success) {
        toast.success("Video berhasil ditambahkan ke Konsel Setara!")
        setAddModalOpen(false)
        setAddUrl("")
        setAddCategory("official")
        fetchVideos()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "Gagal menambahkan video TikTok")
    } finally {
      setAdding(false)
    }
  }

  // 2. Toggle Status Aktif (Tampilkan / Sembunyikan)
  const handleToggleActive = async (video: VideoItem) => {
    const newStatus = video.is_active === 1 ? 0 : 1
    // Optimistic update
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, is_active: newStatus } : v))
    )

    try {
      await api.patch(`/api/v1/tiktok/toggle/${video.id}`, {
        is_active: newStatus === 1,
      })
      toast.success(
        newStatus === 1
          ? "Video sekarang aktif dan tampil di aplikasi mobile"
          : "Video disembunyikan dari aplikasi mobile"
      )
    } catch (err: any) {
      // Revert on error
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, is_active: video.is_active } : v))
      )
      toast.error("Gagal mengubah status video")
    }
  }

  // 3. Edit Video
  const openEdit = (video: VideoItem) => {
    setEditingVideo(video)
    setEditTitle(video.title)
    setEditCategory(video.category)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVideo) return

    setSavingEdit(true)
    try {
      const res = await api.put(`/api/v1/tiktok/${editingVideo.id}`, {
        title: editTitle.trim(),
        category: editCategory,
      })
      if (res.data.success) {
        toast.success("Informasi video berhasil diperbarui")
        setEditModalOpen(false)
        fetchVideos()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memperbarui video")
    } finally {
      setSavingEdit(false)
    }
  }

  // 4. Hapus Video
  const confirmDelete = (video: VideoItem) => {
    setVideoToDelete(video)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!videoToDelete) return
    setDeleting(true)
    try {
      const res = await api.delete(`/api/v1/tiktok/${videoToDelete.id}`)
      if (res.data.success) {
        toast.success("Video berhasil dihapus permanen")
        setDeleteModalOpen(false)
        setVideoToDelete(null)
        fetchVideos()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus video")
    } finally {
      setDeleting(false)
    }
  }

  // 5. Open Preview
  const openPreview = (video: VideoItem) => {
    setPreviewVideo(video)
    setPreviewModalOpen(true)
  }

  // Hitung jumlah kategori
  const officialCount = videos.filter((v) => v.category === "official").length
  const dailyCount = videos.filter((v) => v.category === "daily").length

  return (
    <AuthGuard>
      <BaseLayout
        title="Video Konsel"
        description="Kelola video liputan Diskominfo Konsel untuk pemutaran langsung di aplikasi mobile Android."
      >
        <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Video className="w-7 h-7 text-primary" />
                Video Konsel
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Kelola video liputan Diskominfo Konsel untuk pemutaran langsung di aplikasi mobile Android.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchVideos}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Segarkan
              </Button>
              <Button
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Tambah Video Baru
              </Button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full text-xs"
                >
                  Semua ({videos.length})
                </Button>
                <Button
                  variant={selectedCategory === "official" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("official")}
                  className={`rounded-full text-xs ${
                    selectedCategory === "official"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-blue-600 border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  Official ({officialCount})
                </Button>
                <Button
                  variant={selectedCategory === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("daily")}
                  className={`rounded-full text-xs ${
                    selectedCategory === "daily"
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "text-amber-600 border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  Daily ({dailyCount})
                </Button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari judul liputan video..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary" className="h-9">
                  Cari
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 py-3.5 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Daftar Video Liputan</CardTitle>
                  <CardDescription className="text-xs">
                    Total {videos.length} video terdaftar di database Konsel Setara
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-16 h-24 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <div className="py-16 text-center">
                  <Film className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Belum ada video ditemukan
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Belum ada video yang tersimpan untuk filter ini. Silakan tambahkan video baru menggunakan tautan video TikTok.
                  </p>
                  <Button size="sm" onClick={() => setAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Tambah Video Sekarang
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[110px] text-center">Cover</TableHead>
                        <TableHead>Informasi Liputan Video</TableHead>
                        <TableHead className="w-[120px]">Kategori</TableHead>
                        <TableHead className="w-[130px]">Status Mobile</TableHead>
                        <TableHead className="w-[140px] text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((vid) => (
                        <TableRow key={vid.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors">
                          {/* Thumbnail / Cover with Play Trigger */}
                          <TableCell className="p-3 text-center">
                            <div
                              onClick={() => openPreview(vid)}
                              className="group relative w-16 h-24 mx-auto rounded-lg overflow-hidden bg-slate-900 cursor-pointer shadow-xs border border-slate-200 dark:border-slate-800"
                              title="Klik untuk putar preview video"
                            >
                              <img
                                src={vid.cover_url || "https://placehold.co/120x180?text=No+Cover"}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                <div className="w-7 h-7 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Title & Info */}
                          <TableCell className="p-3">
                            <div className="space-y-1.5 max-w-lg">
                              <h4
                                onClick={() => openPreview(vid)}
                                className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-primary cursor-pointer leading-snug"
                              >
                                {vid.title || "Video Pemkab Konawe Selatan"}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  @{vid.author_username || "diskominfo.konsel"}
                                </span>
                                <span>•</span>
                                <span>ID: {vid.tiktok_id}</span>
                                {vid.play_url && (
                                  <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                      <CheckCircle2 className="w-3 h-3" /> Direct MP4
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Kategori Badge */}
                          <TableCell className="p-3">
                            {vid.category === "daily" ? (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/50 hover:bg-amber-100 font-medium">
                                Daily
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/50 hover:bg-blue-100 font-medium">
                                Official
                              </Badge>
                            )}
                          </TableCell>

                          {/* Status Mobile Switch */}
                          <TableCell className="p-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={vid.is_active === 1}
                                onCheckedChange={() => handleToggleActive(vid)}
                                aria-label="Toggle status video"
                              />
                              <span className={`text-xs font-medium ${vid.is_active === 1 ? "text-emerald-600" : "text-slate-400"}`}>
                                {vid.is_active === 1 ? "Tampil" : "Sembunyi"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Aksi */}
                          <TableCell className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-primary"
                                onClick={() => openPreview(vid)}
                                title="Tonton Video"
                              >
                                <Play className="w-4 h-4 fill-current" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-blue-600"
                                onClick={() => openEdit(vid)}
                                title="Edit Info"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <a
                                href={vid.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Buka tautan TikTok asli"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                onClick={() => confirmDelete(vid)}
                                title="Hapus Video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 1: Tambah Video Baru (Auto-Extract via URL)              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Tambah Video Konsel Baru
              </DialogTitle>
              <DialogDescription className="text-xs">
                Cukup tempel tautan video TikTok, sistem secara otomatis mengekstrak judul, thumbnail cover, dan pemutar in-app.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="video-url" className="text-xs font-semibold">
                  Tautan Video TikTok <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="video-url"
                  placeholder="https://www.tiktok.com/@diskominfo.konsel/video/..."
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  disabled={adding}
                  className="text-xs"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500">
                  Mendukung format link web browser maupun link bagikan (vt.tiktok.com).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-select" className="text-xs font-semibold">
                  Kategori Video
                </Label>
                <Select
                  value={addCategory}
                  onValueChange={(val: "official" | "daily") => setAddCategory(val)}
                  disabled={adding}
                >
                  <SelectTrigger id="category-select" className="text-xs">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official" className="text-xs">
                      🏛️ Official (Liputan Resmi Pemerintah Kabupaten)
                    </SelectItem>
                    <SelectItem value="daily" className="text-xs">
                      🎬 Daily (Kegiatan & Kreativitas Harian)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <p className="leading-relaxed">
                  Video yang ditambahkan akan langsung dapat diputar oleh masyarakat di beranda aplikasi Android <strong>Konsel Setara</strong> secara in-app tanpa membuka aplikasi TikTok.
                </p>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
                  disabled={adding}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={adding || !addUrl.trim()}
                  className="gap-1.5"
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengekstrak Video...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Simpan Video
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 2: Edit Informasi Video                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                Edit Informasi Video
              </DialogTitle>
              <DialogDescription className="text-xs">
                Perbarui judul atau ubah kategori video liputan ini.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-xs font-semibold">
                  Judul Liputan Video
                </Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={savingEdit}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-xs font-semibold">
                  Kategori
                </Label>
                <Select
                  value={editCategory}
                  onValueChange={(val: "official" | "daily") => setEditCategory(val)}
                  disabled={savingEdit}
                >
                  <SelectTrigger id="edit-category" className="text-xs">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official" className="text-xs">
                      🏛️ Official
                    </SelectItem>
                    <SelectItem value="daily" className="text-xs">
                      🎬 Daily
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                  disabled={savingEdit}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={savingEdit}>
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 3: In-App Video Player Preview                           */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black text-white border-none">
            <div className="relative flex flex-col items-center justify-center min-h-[500px] max-h-[80vh] bg-black">
              {previewVideo?.play_url ? (
                <video
                  src={previewVideo.play_url}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full max-h-[75vh] object-contain"
                />
              ) : previewVideo?.tiktok_id ? (
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${previewVideo.tiktok_id}`}
                  className="w-full h-[550px] border-none"
                  allow="fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-300">Format preview video tidak didukung</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <Badge
                  className={
                    previewVideo?.category === "daily"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  }
                >
                  {previewVideo?.category === "daily" ? "Daily" : "Official"}
                </Badge>
                <a
                  href={previewVideo?.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                >
                  Buka di TikTok <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-200 line-clamp-2">{previewVideo?.title}</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MODAL 4: Konfirmasi Hapus Video                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Hapus Video Konsel
              </DialogTitle>
              <DialogDescription className="text-xs">
                Apakah Anda yakin ingin menghapus video ini secara permanen dari database Konsel Setara?
              </DialogDescription>
            </DialogHeader>

            {videoToDelete && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {videoToDelete.title}
                </p>
                <p className="text-slate-500 mt-1">ID: {videoToDelete.tiktok_id}</p>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus Permanen
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </BaseLayout>
    </AuthGuard>
  )
}

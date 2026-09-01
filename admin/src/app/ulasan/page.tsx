"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
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
import { Star, Search, ChevronLeft, ChevronRight, Loader2, X, RefreshCw, Filter } from "lucide-react"
import api from "@/lib/api"

interface Ulasan {
  id: string
  nama: string
  app: string
  rating: number
  komentar: string
  createdAt: string
}

interface FetchUlasanResponse {
  data: Ulasan[]
  jml_data: number
  total: number
}

interface AplikasiOption {
  id: string
  nama: string
  kategori?: string
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`}
        />
      ))}
    </div>
  )
}

function formatTanggal(dateStr: string) {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Fetcher function using fast indexed endpoint
const fetchUlasanApi = async (page: number, search: string, aplikasiId: string): Promise<FetchUlasanResponse> => {
  const res = await api.post("/api/v1/skm/viewUlasanFast", {
    data_ke: page,
    cari_value: search,
    aplikasi_id: aplikasiId,
  })
  return {
    data: res.data.data || [],
    jml_data: res.data.jml_data || 1,
    total: res.data.total || 0,
  }
}

const fetchAplikasiList = async (): Promise<AplikasiOption[]> => {
  try {
    const res = await api.get("/api/v1/skm/listAplikasi")
    return res.data?.data || []
  } catch (err) {
    console.error("Gagal memuat list aplikasi:", err)
    return []
  }
}

export default function Page() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [selectedLayanan, setSelectedLayanan] = useState("all")

  // Query list aplikasi
  const { data: aplikasiOptions = [] } = useQuery({
    queryKey: ["skm_aplikasi_list"],
    queryFn: fetchAplikasiList,
    staleTime: 1000 * 60 * 10,
  })

  // TanStack Query with automatic caching & smooth transitions
  const {
    data: queryResult,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["ulasan", page, activeSearch, selectedLayanan],
    queryFn: () => fetchUlasanApi(page, activeSearch, selectedLayanan),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
  })

  const ulasanList = queryResult?.data || []
  const totalPages = queryResult?.jml_data || 1
  const totalCount = queryResult?.total || 0

  // Prefetch next page for 0ms instant navigation
  useEffect(() => {
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["ulasan", page + 1, activeSearch, selectedLayanan],
        queryFn: () => fetchUlasanApi(page + 1, activeSearch, selectedLayanan),
      })
    }
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["ulasan", page - 1, activeSearch, selectedLayanan],
        queryFn: () => fetchUlasanApi(page - 1, activeSearch, selectedLayanan),
      })
    }
  }, [page, totalPages, activeSearch, selectedLayanan, queryClient])

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setPage(1)
    setActiveSearch(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setActiveSearch("")
    setPage(1)
  }

  const handleLayananChange = (val: string) => {
    setSelectedLayanan(val)
    setPage(1)
  }

  return (
    <AuthGuard>
      <BaseLayout title="Ulasan & Komentar" description="Pantau seluruh tanggapan dan indeks kepuasan masyarakat terhadap layanan publik">
        <div className="px-4 lg:px-6 space-y-4">
          <Card className="relative overflow-hidden border-border/60 shadow-sm">
            {/* Top Loading Progress Line for background re-fetching */}
            {isFetching && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden z-10">
                <div className="h-full bg-primary animate-pulse w-full" />
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">
                      Daftar Ulasan Masuk
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {totalCount.toLocaleString()} Data
                    </Badge>
                  </div>
                  <CardDescription className="mt-0.5">
                    Data realtime termutakhir dari survei kepuasan masyarakat
                  </CardDescription>
                </div>

                {/* Filter & Search Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                  {/* Filter Dropdown Layanan */}
                  <div className="w-full sm:w-52 shrink-0">
                    <Select value={selectedLayanan} onValueChange={handleLayananChange}>
                      <SelectTrigger className="h-9 text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <SelectValue placeholder="Semua Layanan" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">
                          Semua Layanan
                        </SelectItem>
                        {aplikasiOptions.map((app) => (
                          <SelectItem key={app.id} value={app.id} className="text-xs">
                            {app.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Bar */}
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama, komentar..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-8 pr-8 h-9 text-sm"
                      />
                      {searchInput && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button type="submit" size="sm" className="h-9 px-3 shrink-0" disabled={isFetching}>
                      {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span className="hidden sm:inline ml-1.5">Cari</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => refetch()}
                      disabled={isFetching}
                      title="Refresh Data"
                    >
                      <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    </Button>
                  </form>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border bg-card overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[180px] whitespace-nowrap">Nama Responden</TableHead>
                      <TableHead className="w-[140px] whitespace-nowrap">Layanan</TableHead>
                      <TableHead className="w-[140px] whitespace-nowrap">Rating</TableHead>
                      <TableHead className="min-w-[280px]">Komentar & Masukan</TableHead>
                      <TableHead className="w-[170px] whitespace-nowrap text-right">Waktu Ulasan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : ulasanList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          {activeSearch || selectedLayanan !== "all"
                            ? "Tidak ada ulasan yang cocok dengan kriteria filter atau pencarian yang dipilih"
                            : "Belum ada data ulasan tersimpan"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      ulasanList.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-foreground whitespace-nowrap">
                            {item.nama || "Anonim"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className="font-medium text-xs bg-muted/50 uppercase cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors"
                              onClick={() => {
                                const match = aplikasiOptions.find(
                                  (a) => a.nama.toLowerCase() === (item.app || "").toLowerCase()
                                )
                                if (match) {
                                  setSelectedLayanan(match.id)
                                  setPage(1)
                                }
                              }}
                              title="Klik untuk filter layanan ini"
                            >
                              {item.app || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <RatingStars rating={item.rating} />
                              <span className="text-xs font-semibold text-muted-foreground">({item.rating})</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground/90 pr-6">
                            {item.komentar ? (
                              <p className="leading-relaxed break-words">{item.komentar}</p>
                            ) : (
                              <span className="text-muted-foreground/60 italic text-xs">Tanpa komentar tertulis</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {formatTanggal(item.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>
                    Menampilkan <strong className="text-foreground">{ulasanList.length > 0 ? (page - 1) * 10 + 1 : 0}</strong> -{" "}
                    <strong className="text-foreground">{Math.min(page * 10, totalCount)}</strong> dari{" "}
                    <strong className="text-foreground">{totalCount.toLocaleString()}</strong> data
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Halaman <strong className="text-foreground">{page}</strong> dari <strong className="text-foreground">{totalPages}</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    </AuthGuard>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from "lucide-react"
import api from "@/lib/api"

interface Komentar {
  id: string
  nama: string
  komentar: string
  rating: number
  layanan: string
  waktu: string
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
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

export function SkmRecentReviews() {
  const [data, setData] = useState<Komentar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/v1/skm/getDashboard")
      .then((res) => setData(res.data.komentarPengguna || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ulasan Terbaru</CardTitle>
        <CardDescription>5 komentar terakhir dari masyarakat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada ulasan</p>
          )}
          {data.map((item) => (
            <div key={item.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">
                  {(item.nama || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{item.nama || "Anonim"}</p>
                  <RatingStars rating={item.rating} />
                </div>
                <p className="text-xs text-muted-foreground">{item.layanan}</p>
                <p className="text-sm">{item.komentar || "-"}</p>
                <p className="text-xs text-muted-foreground">{formatTanggal(item.waktu)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

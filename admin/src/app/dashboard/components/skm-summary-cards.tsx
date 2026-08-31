"use client"

import { useState, useEffect } from "react"
import { Star, Users, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"

interface SummaryData {
  skorKepuasan: number
  totalResponden: number
  totalLayanan: number
}

export function SkmSummaryCards() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/v1/skm/getDashboard")
      .then((res) => setData(res.data.summary))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Skor Kepuasan",
      value: data?.skorKepuasan || 0,
      suffix: "/ 5.0",
      description: "Rata-rata rating dari seluruh ulasan",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "Total Responden",
      value: data?.totalResponden || 0,
      suffix: "orang",
      description: "Jumlah masyarakat yang memberikan ulasan",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Layanan",
      value: data?.totalLayanan || 0,
      suffix: "layanan",
      description: "Jumlah aplikasi/layanan yang disurvei",
      icon: Briefcase,
      color: "text-green-500",
    },
  ]

  return (
    <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value} <span className="text-sm font-normal text-muted-foreground">{card.suffix}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

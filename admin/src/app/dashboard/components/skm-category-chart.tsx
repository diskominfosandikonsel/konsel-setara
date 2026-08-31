"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import api from "@/lib/api"

interface KategoriData {
  nilai: string
  jumlah: number
  fill: string
}

const chartConfig = {
  jumlah: {
    label: "Jumlah",
  },
  "Sangat Puas": { label: "Sangat Puas", color: "#10b981" },
  "Puas": { label: "Puas", color: "#60a5fa" },
  "Cukup": { label: "Cukup", color: "#facc15" },
  "Kurang": { label: "Kurang", color: "#f97316" },
  "Kecewa": { label: "Kecewa", color: "#ef4444" },
}

export function SkmCategoryChart() {
  const [data, setData] = useState<KategoriData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/v1/skm/getDashboard")
      .then((res) => setData(res.data.kategoriKepuasan || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Kategori Kepuasan</CardTitle>
        <CardDescription>Jumlah responden berdasarkan tingkat kepuasan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="nilai" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

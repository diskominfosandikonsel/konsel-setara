import { useState, useEffect, useCallback } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RefreshCw,
  Clock,
  Database,
  Calendar,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  Sliders,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

interface SyncConfig {
  id: number
  is_active: boolean
  schedule_time: string
  cron_expression: string
  frequency_type?: "daily" | "interval_days" | "weekly" | "monthly" | "custom"
  frequency_value?: number
  sync_year: string
  last_sync_at: string | null
  last_status: string
  last_message: string | null
  total_paket_synced: number
  total_pagu_synced: number | string
  updated_at: string
  is_running?: boolean
}

interface SyncLog {
  id: number
  sync_year: string
  started_at: string
  finished_at: string | null
  status: "running" | "success" | "failed"
  total_paket: number
  total_pagu: string | number
  triggered_by: string
  message: string
}

interface RupItem {
  id: string
  kode_rup: string
  nama_paket: string
  opd: string
  metode: string
  pagu: number
  sumber_dana: string
  tahun: string
  jenis: string
  cara_pengadaan: string
}

export default function RupSyncPage() {
  const [config, setConfig] = useState<SyncConfig | null>(null)
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [triggering, setTriggering] = useState(false)

  // Form State
  const [isActive, setIsActive] = useState(true)
  const [scheduleTime, setScheduleTime] = useState("02:00")
  const [frequencyType, setFrequencyType] = useState<"daily" | "interval_days" | "weekly" | "monthly">("daily")
  const [intervalDays, setIntervalDays] = useState(3)
  const [dayOfWeek, setDayOfWeek] = useState(1) // 1 = Senin
  const [dayOfMonth, setDayOfMonth] = useState(1) // 1 = Tanggal 1
  const [syncYear, setSyncYear] = useState(new Date().getFullYear().toString())
  const [showAdvancedCron, setShowAdvancedCron] = useState(false)
  const [cronExpression, setCronExpression] = useState("0 2 * * *")

  // Preview Data State
  const [previewData, setPreviewData] = useState<RupItem[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewSearch, setPreviewSearch] = useState("")
  const [previewTotal, setPreviewTotal] = useState(0)

  const getFrequencyLabel = (type?: string, val?: number, time?: string) => {
    const t = time || scheduleTime || "02:00"
    switch (type) {
      case "interval_days":
        return `Setiap ${val || 2} hari sekali pukul ${t} WITA`
      case "weekly": {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
        const dName = days[Number(val)] || "Senin"
        return `Setiap hari ${dName} pukul ${t} WITA`
      }
      case "monthly":
        return `Setiap tanggal ${val || 1} tiap bulan pukul ${t} WITA`
      case "custom":
        return `Kustom Cron: ${cronExpression}`
      case "daily":
      default:
        return `Setiap hari pukul ${t} WITA`
    }
  }

  const fetchConfig = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/rup/sync/config")
      if (res.data?.success && res.data?.data) {
        const data = res.data.data
        setConfig(data)
        setIsActive(Boolean(data.is_active))
        setScheduleTime(data.schedule_time || "02:00")
        setCronExpression(data.cron_expression || "0 2 * * *")
        setSyncYear(data.sync_year || new Date().getFullYear().toString())
        if (data.frequency_type && data.frequency_type !== "custom") {
          setFrequencyType(data.frequency_type)
          if (data.frequency_type === "interval_days") {
            setIntervalDays(data.frequency_value || 3)
          } else if (data.frequency_type === "weekly") {
            setDayOfWeek(data.frequency_value !== undefined ? data.frequency_value : 1)
          } else if (data.frequency_type === "monthly") {
            setDayOfMonth(data.frequency_value || 1)
          }
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal memuat konfigurasi sinkronisasi RUP")
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/rup/sync/logs?limit=10")
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setLogs(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchPreviewData = useCallback(async (searchQuery = "") => {
    setPreviewLoading(true)
    try {
      const res = await api.get("/api/v1/rup/paket-penyedia", {
        params: {
          tahun: syncYear,
          page: 1,
          limit: 10,
          search: searchQuery,
        },
      })
      if (res.data?.success) {
        setPreviewData(res.data.data || [])
        setPreviewTotal(res.data.total || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPreviewLoading(false)
    }
  }, [syncYear])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchConfig(), fetchLogs()])
    setLoading(false)
    fetchPreviewData()
  }, [fetchConfig, fetchLogs, fetchPreviewData])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Polling saat status running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (config?.is_running || config?.last_status === "running") {
      interval = setInterval(() => {
        fetchConfig()
        fetchLogs()
      }, 3000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [config?.is_running, config?.last_status, fetchConfig, fetchLogs])

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      let freqVal = 1
      if (frequencyType === "interval_days") freqVal = Number(intervalDays) || 2
      else if (frequencyType === "weekly") freqVal = Number(dayOfWeek)
      else if (frequencyType === "monthly") freqVal = Number(dayOfMonth) || 1

      const payload: Record<string, any> = {
        is_active: isActive,
        schedule_time: scheduleTime,
        sync_year: syncYear,
        frequency_type: frequencyType,
        frequency_value: freqVal,
      }
      if (showAdvancedCron && cronExpression) {
        payload.cron_expression = cronExpression
        payload.frequency_type = "custom"
      }

      const res = await api.post("/api/v1/rup/sync/config", payload)
      if (res.data?.success) {
        toast.success(res.data.message || "Konfigurasi jadwal RUP berhasil diperbarui!")
        fetchConfig()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.error || "Gagal menyimpan jadwal RUP")
    } finally {
      setSaving(false)
    }
  }

  const handleTriggerSync = async () => {
    setTriggering(true)
    try {
      const res = await api.post("/api/v1/rup/sync/trigger", { tahun: syncYear })
      if (res.data?.success) {
        toast.success(res.data.message || "Sinkronisasi dimulai di background!")
        fetchConfig()
        fetchLogs()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || err.response?.data?.error || "Gagal memicu sinkronisasi")
    } finally {
      setTriggering(false)
    }
  }

  const formatRupiah = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val
    if (isNaN(num)) return "Rp 0"
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
  }

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-"
    try {
      const d = new Date(isoString)
      return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return isoString
    }
  }

  const isSyncRunning = config?.is_running || config?.last_status === "running"

  return (
    <AuthGuard>
      <BaseLayout title="Sinkronisasi RUP LKPP">
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-sm">
                  <Database className="h-3.5 w-3.5" />
                  <span>Integrasi INAPROC LKPP &bull; Konawe Selatan</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Sinkronisasi Data RUP
                </h1>
                <p className="text-sm text-emerald-100 max-w-2xl">
                  Otomatisasi pengambilan data Rencana Umum Pengadaan dari web INAPROC LKPP ke database lokal Pemerintah Kabupaten Konawe Selatan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAll}
                  disabled={loading}
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                >
                  <RotateCcw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                  Segarkan
                </Button>
                <Button
                  size="sm"
                  onClick={handleTriggerSync}
                  disabled={triggering || isSyncRunning}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-md font-semibold"
                >
                  {isSyncRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1.5 animate-spin text-emerald-600" />
                      Sedang Menyinkronkan...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1.5 fill-emerald-600 text-emerald-600" />
                      Sinkronkan Sekarang
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-xl" />
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Paket Tersimpan</CardTitle>
                <Database className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-foreground">
                      {(config?.total_paket_synced || 0).toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paket RUP T.A. {config?.sync_year || syncYear}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Pagu Anggaran</CardTitle>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-xl font-bold text-foreground truncate" title={formatRupiah(config?.total_pagu_synced || 0)}>
                      {formatRupiah(config?.total_pagu_synced || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Terdata di MySQL lokal
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Jadwal Cronjob Otomatis</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">
                        {config?.schedule_time || "02:00"}
                      </span>
                      <Badge variant={config?.is_active ? "default" : "secondary"} className={config?.is_active ? "bg-emerald-600 text-white" : ""}>
                        {config?.is_active ? "AKTIF" : "OFF"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate" title={getFrequencyLabel(config?.frequency_type, config?.frequency_value, config?.schedule_time)}>
                      {getFrequencyLabel(config?.frequency_type, config?.frequency_value, config?.schedule_time)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Sinkronisasi Terakhir</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-sm font-semibold text-foreground truncate">
                      {formatDate(config?.last_sync_at)}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {isSyncRunning ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Sedang Berjalan
                        </Badge>
                      ) : config?.last_status === "success" ? (
                        <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                          Sukses
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {config?.last_status || "Belum ada"}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Pengaturan Cronjob & Waktu Sinkronisasi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border shadow-xs">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-600" />
                  <div>
                    <CardTitle className="text-base font-semibold">Pengaturan Cronjob</CardTitle>
                    <CardDescription className="text-xs">
                      Atur ON/OFF, frekuensi berkala, dan jam sinkronisasi otomatis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* Toggle ON/OFF */}
                <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="cron-toggle" className="text-sm font-semibold cursor-pointer">
                      Penjadwalan Otomatis
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive ? "Cronjob aktif dan otomatis mengeksekusi sesuai jadwal." : "Cronjob nonaktif sementara."}
                    </p>
                  </div>
                  <Switch
                    id="cron-toggle"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    aria-label="Toggle Cronjob"
                  />
                </div>

                {/* Pilihan Frekuensi Sinkronisasi */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pilih Frekuensi Sinkronisasi
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { key: "daily", label: "Setiap Hari" },
                      { key: "interval_days", label: "Beberapa Hari" },
                      { key: "weekly", label: "Setiap Minggu" },
                      { key: "monthly", label: "Setiap Bulan" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        disabled={!isActive}
                        onClick={() => setFrequencyType(f.key as any)}
                        className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all ${
                          frequencyType === f.key
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-background hover:bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Pengaturan Detail Berdasarkan Frekuensi */}
                  {frequencyType === "interval_days" && (
                    <div className="p-3 rounded-lg border bg-muted/20 space-y-2 mt-2">
                      <Label className="text-xs font-medium text-foreground">
                        Ulangi Sinkronisasi Setiap:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={intervalDays}
                          onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value) || 1))}
                          disabled={!isActive}
                          className="h-8 w-20 font-mono text-center"
                        />
                        <span className="text-xs text-muted-foreground">Hari sekali</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[2, 3, 5, 7, 10, 14].map((d) => (
                          <button
                            key={d}
                            type="button"
                            disabled={!isActive}
                            onClick={() => setIntervalDays(d)}
                            className={`text-[11px] px-2 py-0.5 rounded border ${
                              intervalDays === d
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            Tiap {d} Hari
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {frequencyType === "weekly" && (
                    <div className="p-3 rounded-lg border bg-muted/20 space-y-2 mt-2">
                      <Label className="text-xs font-medium text-foreground">
                        Pilih Hari dalam Seminggu:
                      </Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { val: 1, name: "Senin" },
                          { val: 2, name: "Selasa" },
                          { val: 3, name: "Rabu" },
                          { val: 4, name: "Kamis" },
                          { val: 5, name: "Jumat" },
                          { val: 6, name: "Sabtu" },
                          { val: 0, name: "Minggu" },
                        ].map((d) => (
                          <button
                            key={d.val}
                            type="button"
                            disabled={!isActive}
                            onClick={() => setDayOfWeek(d.val)}
                            className={`text-xs py-1 px-1.5 rounded border text-center font-medium ${
                              dayOfWeek === d.val
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {d.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {frequencyType === "monthly" && (
                    <div className="p-3 rounded-lg border bg-muted/20 space-y-2 mt-2">
                      <Label className="text-xs font-medium text-foreground">
                        Pilih Tanggal Setiap Bulan:
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Tanggal</span>
                        <Input
                          type="number"
                          min="1"
                          max="28"
                          value={dayOfMonth}
                          onChange={(e) => setDayOfMonth(Math.min(28, Math.max(1, parseInt(e.target.value) || 1)))}
                          disabled={!isActive}
                          className="h-8 w-20 font-mono text-center"
                        />
                        <span className="text-xs text-muted-foreground">(tiap awal/tengah bulan)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[1, 5, 10, 15, 20, 25].map((tgl) => (
                          <button
                            key={tgl}
                            type="button"
                            disabled={!isActive}
                            onClick={() => setDayOfMonth(tgl)}
                            className={`text-[11px] px-2 py-0.5 rounded border ${
                              dayOfMonth === tgl
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            Tgl {tgl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Jam Manual */}
                <div className="space-y-2">
                  <Label htmlFor="schedule-time" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pilih Waktu Eksekusi (Jam Manual)
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      disabled={!isActive}
                      className="pl-9 font-mono text-base"
                    />
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-md border border-emerald-200 dark:border-emerald-800">
                    🕒 <strong>Jadwal:</strong> {getFrequencyLabel(frequencyType, frequencyType === 'interval_days' ? intervalDays : frequencyType === 'weekly' ? dayOfWeek : dayOfMonth, scheduleTime)}
                  </p>

                  {/* Preset Jam Cepat */}
                  <div className="pt-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Pilihan Jam Populer:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        { label: "00:00 (Tengah Malam)", val: "00:00" },
                        { label: "02:00 (Dini Hari)", val: "02:00" },
                        { label: "04:00 (Subuh)", val: "04:00" },
                        { label: "06:00 (Pagi)", val: "06:00" },
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          disabled={!isActive}
                          onClick={() => setScheduleTime(p.val)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            scheduleTime === p.val
                              ? "bg-emerald-600 text-white border-emerald-600 font-medium"
                              : "bg-background hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tahun Anggaran */}
                <div className="space-y-2">
                  <Label htmlFor="sync-year" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tahun Anggaran RUP
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sync-year"
                      type="number"
                      min="2020"
                      max="2030"
                      value={syncYear}
                      onChange={(e) => setSyncYear(e.target.value)}
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>

                {/* Mode Lanjutan (Cron Expression) */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Format Cron Tingkat Lanjut</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedCron(!showAdvancedCron)}
                      className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
                    >
                      {showAdvancedCron ? "Sembunyikan" : "Tampilkan"}
                    </Button>
                  </div>

                  {showAdvancedCron && (
                    <div className="space-y-1.5 pt-1">
                      <Input
                        value={cronExpression}
                        onChange={(e) => setCronExpression(e.target.value)}
                        placeholder="0 2 * * *"
                        className="font-mono text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Standar 5 format (menit jam tgl bln hari). Contoh: <code className="bg-muted px-1 rounded">0 2 * * *</code> (setiap 02:00).
                      </p>
                    </div>
                  )}
                </div>

                {/* Tombol Simpan Jadwal */}
                <Button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan Jadwal...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Simpan Pengaturan Jadwal
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Riwayat Log Sinkronisasi */}
            <Card className="lg:col-span-2 border shadow-xs">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-600" />
                    <div>
                      <CardTitle className="text-base font-semibold">Riwayat Eksekusi Sinkronisasi</CardTitle>
                      <CardDescription className="text-xs">
                        Catatan audit riwayat eksekusi otomatis (cron) maupun manual admin
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchLogs} className="h-8 text-xs">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Refresh Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/50 border-b text-muted-foreground uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Waktu Mulai</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold">Pemicu</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Paket</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Total Pagu</th>
                        <th className="py-2.5 px-4 font-semibold">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            Belum ada riwayat sinkronisasi
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                              {formatDate(log.started_at)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {log.status === "success" && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                                  Sukses
                                </Badge>
                              )}
                              {log.status === "running" && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                                  <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" /> Berjalan
                                </Badge>
                              )}
                              {log.status === "failed" && (
                                <Badge variant="destructive">Gagal</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="capitalize px-2 py-0.5 rounded bg-muted font-medium text-[11px]">
                                {log.triggered_by.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-right whitespace-nowrap">
                              {log.total_paket?.toLocaleString("id-ID") || "-"}
                            </td>
                            <td className="py-3 px-4 font-mono text-right whitespace-nowrap">
                              {log.total_pagu ? formatRupiah(log.total_pagu) : "-"}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground max-w-xs truncate" title={log.message}>
                              {log.message || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Data RUP di Database */}
          <Card className="border shadow-xs">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-base font-semibold">
                      Preview Data RUP di Database Lokal ({previewTotal.toLocaleString("id-ID")} Paket)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Menampilkan contoh paket RUP yang berhasil tersimpan di MySQL `konsel_setara`
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Cari paket / OPD / kode RUP..."
                      value={previewSearch}
                      onChange={(e) => {
                        setPreviewSearch(e.target.value)
                        fetchPreviewData(e.target.value)
                      }}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 border-b text-muted-foreground uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Kode RUP</th>
                      <th className="py-2.5 px-4 font-semibold">Nama Paket Pengadaan</th>
                      <th className="py-2.5 px-4 font-semibold">Unit Kerja (OPD)</th>
                      <th className="py-2.5 px-4 font-semibold">Metode / Cara</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Pagu Anggaran</th>
                      <th className="py-2.5 px-4 font-semibold">Sumber Dana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="py-3 px-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : previewData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Tidak ada paket RUP yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      previewData.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-emerald-700 whitespace-nowrap">
                            {item.kode_rup}
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground max-w-sm">
                            <div className="line-clamp-2" title={item.nama_paket}>
                              {item.nama_paket}
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                              {item.jenis}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-xs truncate" title={item.opd}>
                            {item.opd}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-[11px]">
                              {item.metode || item.cara_pengadaan || "Penyedia"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-right text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                            {formatRupiah(item.pagu)}
                          </td>
                          <td className="py-3 px-4 font-medium whitespace-nowrap text-muted-foreground">
                            {item.sumber_dana}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    </AuthGuard>
  )
}

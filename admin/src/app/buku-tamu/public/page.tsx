import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { Building2, CalendarDays, CheckCircle2, Clock3, Loader2, Search, ShieldCheck, UserRound, UsersRound, Wifi } from "lucide-react"
import { SearchableSelect } from "../components/searchable-select"
import { apiErrorMessage, type GuestbookLocation, type VisitorType } from "../types"

interface EmployeeResult {
  nip: string
  nama: string
  jabatan: string
  opd: string
  unit_id: string | null
  sub_unit_id: string | null
  sub_unit_kerja: string | null
}

interface EmployeeUnitOption {
  id: string
  name: string
  unit_id?: string
}

interface EmployeeFilters {
  units: EmployeeUnitOption[]
  sub_units: EmployeeUnitOption[]
}

const initialExternal = { name: "", gender: "", institution: "", position: "", phone: "" }

export default function GuestbookPublicFormPage() {
  const { token = "" } = useParams()
  const [now, setNow] = useState(new Date())
  const [visitorType, setVisitorType] = useState<VisitorType>("internal")
  const [purpose, setPurpose] = useState("")
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [unitId, setUnitId] = useState("")
  const [subUnitId, setSubUnitId] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResult | null>(null)
  const [external, setExternal] = useState(initialExternal)
  const [success, setSuccess] = useState<{ message: string; name: string } | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(employeeSearch.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [employeeSearch])

  const locationQuery = useQuery({
    queryKey: ["guestbook-public-location", token],
    queryFn: async () => {
      const response = await api.get(`/api/v1/guestbook/public/${token}`)
      return response.data.data as GuestbookLocation
    },
    retry: false,
  })

  const employeesQuery = useQuery({
    queryKey: ["guestbook-public-employees", token, debouncedSearch, unitId, subUnitId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/guestbook/public/${token}/employees`, {
        params: {
          q: debouncedSearch,
          unit_id: unitId || undefined,
          sub_unit_id: subUnitId || undefined,
        },
      })
      return (response.data.data || []) as EmployeeResult[]
    },
    enabled: visitorType === "internal" && debouncedSearch.length >= 3 && !selectedEmployee,
    staleTime: 60_000,
  })

  const employeeFiltersQuery = useQuery({
    queryKey: ["guestbook-public-employee-filters", token],
    queryFn: async () => {
      const response = await api.get(`/api/v1/guestbook/public/${token}/employee-filters`)
      return response.data.data as EmployeeFilters
    },
    enabled: visitorType === "internal" && Boolean(token),
    staleTime: 10 * 60 * 1000,
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/v1/guestbook/public/${token}/visits`, {
        visitor_type: visitorType,
        purpose,
        nip: selectedEmployee?.nip,
        ...(visitorType === "internal" ? {} : external),
      })
      return response.data as { message: string; data: { visitor_name: string } }
    },
    onSuccess: (response) => setSuccess({ message: response.message, name: response.data.visitor_name }),
  })

  const chooseType = (type: VisitorType) => {
    setVisitorType(type)
    setSelectedEmployee(null)
    setEmployeeSearch("")
    setUnitId("")
    setSubUnitId("")
    submitMutation.reset()
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    submitMutation.reset()
    submitMutation.mutate()
  }

  const fillExternal = (field: keyof typeof external, value: string) => setExternal((current) => ({ ...current, [field]: value }))
  const subUnitOptions = (employeeFiltersQuery.data?.sub_units || []).filter((item) => !unitId || item.unit_id === unitId)
  const dateLabel = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Makassar" }).format(now)
  const timeLabel = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }).format(now)

  if (locationQuery.isLoading) return <PublicShell><div className="flex min-h-[420px] flex-col items-center justify-center"><Loader2 className="size-10 animate-spin text-emerald-600" /><p className="mt-4 text-sm text-slate-500">Membuka Buku Tamu...</p></div></PublicShell>

  if (locationQuery.isError || !locationQuery.data) return <PublicShell><div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center"><div className="rounded-full bg-red-50 p-5"><QrCodeError /></div><h1 className="mt-5 text-xl font-bold text-slate-900">QR tidak dapat digunakan</h1><p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">QR Buku Tamu tidak ditemukan, sudah diganti, atau telah dinonaktifkan. Silakan hubungi petugas resepsionis.</p></div></PublicShell>

  if (success) return (
    <PublicShell>
      <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full bg-emerald-100 p-5"><CheckCircle2 className="size-16 text-emerald-600" /></div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Check-in Berhasil</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Selamat Datang</h1>
        <p className="mt-2 text-lg font-semibold text-slate-700">{success.name}</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">Kunjungan Anda ke <b>{locationQuery.data.opd_name}</b> sudah tercatat. Silakan melapor kepada petugas.</p>
        <Button className="mt-8 h-auto w-full max-w-xs whitespace-normal py-3 bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSuccess(null); setPurpose(""); setSelectedEmployee(null); setEmployeeSearch(""); setUnitId(""); setSubUnitId(""); setExternal(initialExternal); submitMutation.reset() }}>Isi untuk Tamu Berikutnya</Button>
      </div>
    </PublicShell>
  )

  const location = locationQuery.data
  return (
    <PublicShell>
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-lime-700 px-3 pb-11 pt-3 text-white sm:px-5 sm:pb-16 sm:pt-7">
        <div className="absolute -right-14 -top-20 size-60 rounded-full border-[34px] border-white/5" /><div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-lime-300/10 blur-2xl" />
        <div className="relative mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 sm:gap-4"><div className="rounded-lg bg-white p-1.5 shadow-lg sm:rounded-2xl sm:p-2.5"><img src="/logo_konsel.png" alt="Logo Konawe Selatan" className="h-9 w-8 object-contain sm:h-14 sm:w-12" /></div><div className="h-8 w-px bg-white/25 sm:h-11" /><img src="/new_logo_Setara.png" alt="Konsel Setara" className="h-9 w-24 rounded-lg bg-white/95 object-contain p-1.5 sm:h-14 sm:w-36 sm:rounded-xl sm:p-2" /></div>
          <div className="mt-3 text-center sm:mt-6"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-lime-200 sm:text-[11px] sm:tracking-[0.24em]">Buku Tamu Digital</p><h1 className="mt-1 break-words text-lg font-black leading-tight min-[380px]:text-xl sm:mt-2 sm:text-3xl">{location.opd_name}</h1><p className="mt-1 break-words text-[11px] text-emerald-100 sm:mt-2 sm:text-sm">{location.label}</p></div>
        </div>
      </header>

      <main className="relative mx-auto -mt-6 max-w-2xl px-2 pb-8 sm:-mt-9 sm:px-4 sm:pb-10">
        {/* Banner Iklan Konsel Setara (Diatas Form) */}
        <section aria-label="Iklan Konsel Setara" className="mb-3.5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md transition-all hover:shadow-lg sm:mb-5 sm:rounded-3xl">
          <a
            href="https://play.google.com/store/apps/details?id=id.go.konaweselatankab.setara"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden"
            title="Download Aplikasi Konsel Setara di Play Store"
          >
            <img
              src="/banners/banner-konsel-setara.png"
              alt="Banner Konsel Setara"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </a>
        </section>

        <form onSubmit={submit} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-emerald-950/10 sm:rounded-3xl">
          <div className="grid grid-cols-2 divide-x border-b bg-slate-50 text-[11px] sm:text-sm"><div className="flex min-w-0 items-start gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-4 sm:py-3"><CalendarDays className="mt-0.5 size-3.5 shrink-0 text-emerald-600 sm:size-4" /><span className="min-w-0 leading-snug"><span className="block text-[9px] uppercase text-slate-400 sm:text-[10px]">Tanggal</span>{dateLabel}</span></div><div className="flex min-w-0 items-start gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-4 sm:py-3"><Clock3 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 sm:size-4" /><span className="min-w-0 leading-snug"><span className="block text-[9px] uppercase text-slate-400 sm:text-[10px]">Jam</span>{timeLabel} WITA</span></div></div>

          <div className="min-w-0 space-y-3.5 p-3 sm:space-y-6 sm:p-7">
            {location.wifi_ssid && (
              <section className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-2.5 sm:rounded-2xl sm:p-4">
                <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                  <div className="shrink-0 rounded-lg bg-emerald-700 p-2 text-white shadow-sm sm:rounded-xl sm:p-2.5"><Wifi className="size-4 sm:size-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 sm:text-xs sm:tracking-[0.16em]">Wi-Fi Tamu Tersedia</p>
                    <div className="mt-1 grid min-w-0 grid-cols-[66px_minmax(0,1fr)] gap-x-1.5 gap-y-0.5 text-[11px] min-[380px]:grid-cols-[72px_minmax(0,1fr)] sm:mt-2 sm:grid-cols-[78px_minmax(0,1fr)] sm:gap-x-2 sm:gap-y-1 sm:text-sm">
                      <span className="text-slate-500">Nama Wi-Fi</span><strong className="break-all text-slate-900">: {location.wifi_ssid}</strong>
                      <span className="text-slate-500">Password</span><strong className="break-all text-slate-900">: {location.wifi_password || "FREE"}</strong>
                    </div>
                  </div>
                </div>
              </section>
            )}
            <section><div className="grid grid-cols-3 gap-1.5 sm:gap-2"><TypeButton active={visitorType === "internal"} icon={UserRound} label="ASN Konsel" onClick={() => chooseType("internal")} /><TypeButton active={visitorType === "external_employee"} icon={Building2} label="ASN Eksternal" onClick={() => chooseType("external_employee")} /><TypeButton active={visitorType === "external_general"} icon={UsersRound} label="Non ASN / Tamu Umum" onClick={() => chooseType("external_general")} /></div></section>

            {visitorType === "internal" ? (
              <section className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="grid gap-1.5">
                    <Label>Unit Kerja</Label>
                    <SearchableSelect
                      value={unitId}
                      onValueChange={(value) => {
                        setUnitId(value)
                        setSubUnitId("")
                        setSelectedEmployee(null)
                      }}
                      searchPlaceholder="Cari unit kerja..."
                      emptyText="Unit kerja tidak ditemukan."
                      disabled={employeeFiltersQuery.isLoading}
                      className="h-10 border-slate-200 sm:h-11"
                      options={[
                        { value: "", label: "Semua Unit Kerja" },
                        ...(employeeFiltersQuery.data?.units || []).map((item) => ({ value: item.id, label: item.name })),
                      ]}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Sub Unit Kerja</Label>
                    <SearchableSelect
                      value={subUnitId}
                      onValueChange={(value) => {
                        setSubUnitId(value)
                        setSelectedEmployee(null)
                      }}
                      searchPlaceholder="Cari sub unit kerja..."
                      emptyText="Sub unit kerja tidak ditemukan."
                      disabled={employeeFiltersQuery.isLoading}
                      className="h-10 border-slate-200 sm:h-11"
                      options={[
                        { value: "", label: "Semua Sub Unit Kerja" },
                        ...subUnitOptions.map((item) => ({ value: item.id, label: item.name })),
                      ]}
                    />
                  </div>
                </div>
                <div className="grid gap-1.5"><Label htmlFor="employee-search">Nama atau NIP Pegawai <span className="text-red-500">*</span></Label><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-slate-400 sm:top-3" /><Input id="employee-search" value={employeeSearch} onChange={(event) => { setEmployeeSearch(event.target.value); setSelectedEmployee(null) }} className="h-10 pl-9 sm:h-11" placeholder="Ketik minimal 3 huruf..." autoComplete="off" /></div><p className="hidden text-xs text-slate-400 sm:block">Pilih nama dari data resmi SIMPEG.</p></div>
                {employeesQuery.isFetching && <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Mencari pegawai...</div>}
                {!selectedEmployee && (employeesQuery.data?.length || 0) > 0 && <div className="max-h-64 overflow-y-auto rounded-xl border bg-white shadow-lg">{employeesQuery.data?.map((employee) => <button type="button" key={employee.nip} className="block min-w-0 w-full border-b px-3 py-3 text-left transition hover:bg-emerald-50 last:border-0 sm:px-4" onClick={() => { setSelectedEmployee(employee); setEmployeeSearch(employee.nama) }}><p className="break-words text-sm font-bold text-slate-800">{employee.nama}</p><p className="mt-0.5 break-all text-xs font-medium text-emerald-700">NIP {employee.nip}</p><p className="mt-1 break-words text-xs text-slate-500">{employee.jabatan} · {employee.opd}{employee.sub_unit_kerja && employee.sub_unit_kerja !== employee.opd ? ` · ${employee.sub_unit_kerja}` : ""}</p></button>)}</div>}
                {!selectedEmployee && debouncedSearch.length >= 3 && !employeesQuery.isFetching && employeesQuery.data?.length === 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Pegawai tidak ditemukan. Periksa nama/NIP atau pilih jenis tamu eksternal.</div>}
                {selectedEmployee && <div className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex min-w-0 items-start gap-3"><div className="shrink-0 rounded-full bg-emerald-700 p-2 text-white"><CheckCircle2 className="size-4" /></div><div className="min-w-0"><p className="break-words font-bold text-emerald-950">{selectedEmployee.nama}</p><p className="mt-1 break-all text-xs font-semibold text-emerald-700">NIP {selectedEmployee.nip}</p><p className="mt-1 break-words text-xs text-emerald-900/70">{selectedEmployee.jabatan} · {selectedEmployee.opd}{selectedEmployee.sub_unit_kerja && selectedEmployee.sub_unit_kerja !== selectedEmployee.opd ? ` · ${selectedEmployee.sub_unit_kerja}` : ""}</p></div></div></div>}
              </section>
            ) : (
              <section className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama" required><Input value={external.name} onChange={(event) => fillExternal("name", event.target.value)} minLength={3} maxLength={200} required /></Field>
                <Field label="Jenis Kelamin" required><div className="grid grid-cols-2 gap-2"><GenderButton label="Laki-laki" value="L" current={external.gender} onClick={(value) => fillExternal("gender", value)} /><GenderButton label="Perempuan" value="P" current={external.gender} onClick={(value) => fillExternal("gender", value)} /></div></Field>
                <Field label={visitorType === "external_employee" ? "Instansi / OPD Asal" : "Asal / Instansi / Perusahaan"} required><Input value={external.institution} onChange={(event) => fillExternal("institution", event.target.value)} minLength={2} maxLength={255} placeholder={visitorType === "external_employee" ? "Nama instansi atau OPD asal" : "Asal, instansi, organisasi, atau perusahaan"} required /></Field>
                <Field label="Jabatan" required><Input value={external.position} onChange={(event) => fillExternal("position", event.target.value)} minLength={2} maxLength={180} placeholder="Jabatan / pekerjaan" required /></Field>
                <Field label="Nomor HP" required><Input type="tel" value={external.phone} onChange={(event) => fillExternal("phone", event.target.value)} minLength={8} maxLength={30} inputMode="tel" placeholder="08xxxxxxxxxx" required /></Field>
              </section>
            )}

            <Field label="Urusan / Keperluan" required><Textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} minLength={3} maxLength={1000} required className="min-h-20 resize-none sm:min-h-28" placeholder="Tuliskan tujuan kunjungan Anda..." /></Field>

            {submitMutation.isError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiErrorMessage(submitMutation.error, "Kunjungan belum berhasil disimpan. Silakan coba kembali.")}</div>}
            <Button type="submit" className="h-11 w-full bg-emerald-700 text-sm font-bold hover:bg-emerald-800 sm:h-12 sm:text-base" disabled={submitMutation.isPending || (visitorType === "internal" && !selectedEmployee)}>{submitMutation.isPending ? <><Loader2 className="mr-2 size-5 animate-spin" />Menyimpan...</> : "Kirim Buku Tamu"}</Button>
            <p className="hidden items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate-400 sm:flex"><ShieldCheck className="size-3.5" /> Data digunakan untuk administrasi kunjungan dan peningkatan pelayanan.</p>
          </div>
        </form>

        {/* Banner Iklan Warga Bicara (Dibawah Form) */}
        <section aria-label="Iklan Warga Bicara" className="mt-3.5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md transition-all hover:shadow-lg sm:mt-5 sm:rounded-3xl">
          <a
            href="https://play.google.com/store/apps/details?id=com.warga_bicara_mobile&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden"
            title="Download Aplikasi Warga Bicara di Play Store"
          >
            <img
              src="/banners/banner-warga-bicara.png"
              alt="Banner Warga Bicara"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </a>
        </section>
      </main>
    </PublicShell>
  )
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d1fae5_0,#f8fafc_38%,#f1f5f9_100%)] text-slate-900">{children}<footer className="px-4 pb-7 text-center text-xs text-slate-400">© Pemerintah Kabupaten Konawe Selatan · Konsel Setara</footer></div>
}

function TypeButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 text-center text-[9px] font-bold leading-tight transition min-[380px]:min-h-14 min-[380px]:text-[10px] sm:min-h-20 sm:gap-2 sm:rounded-xl sm:px-2 sm:py-2.5 sm:text-xs ${active ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 sm:ring-2 sm:ring-emerald-600/15" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"}`}><Icon className={`size-3.5 shrink-0 sm:size-5 ${active ? "text-emerald-600" : "text-slate-400"}`} /><span className="break-words">{label}</span></button>
}

function GenderButton({ label, value, current, onClick }: { label: string; value: string; current: string; onClick: (value: string) => void }) {
  return <button type="button" onClick={() => onClick(value)} className={`h-9 rounded-md border text-sm transition ${current === value ? "border-emerald-600 bg-emerald-50 font-semibold text-emerald-800" : "border-slate-200 text-slate-600"}`}>{label}</button>
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-1.5"><span className="text-sm font-medium text-slate-700">{label} {required && <span className="text-red-500">*</span>}</span>{children}</label>
}

function QrCodeError() {
  return <svg viewBox="0 0 24 24" className="size-12 text-red-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM18 14h3M14 18v3" /><path d="m5 5 14 14" /></svg>
}

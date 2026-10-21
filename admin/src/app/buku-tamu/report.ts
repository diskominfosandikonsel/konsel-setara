import { formatDateTime, type GuestbookVisit, visitorTypeLabel } from "./types"

export type ReportPeriodType = "daily" | "weekly" | "monthly"

export interface ReportRange {
  from: string
  to: string
}

export interface GuestbookReportResponse {
  data: GuestbookVisit[]
  period: { date_from: string; date_to: string }
  scope: { id: string; name: string } | null
  generated_at: string
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function todayValue(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function monthValue(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function isoWeekValue(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${utcDate.getUTCFullYear()}-W${pad(week)}`
}

function utcDateValue(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function getReportRange(type: ReportPeriodType, value: string): ReportRange | null {
  if (type === "daily") {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? { from: value, to: value } : null
  }

  if (type === "monthly") {
    const match = /^(\d{4})-(\d{2})$/.exec(value)
    if (!match) return null
    const year = Number(match[1])
    const month = Number(match[2])
    if (month < 1 || month > 12) return null
    return {
      from: `${year}-${pad(month)}-01`,
      to: `${year}-${pad(month)}-${pad(new Date(Date.UTC(year, month, 0)).getUTCDate())}`,
    }
  }

  const match = /^(\d{4})-W(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const week = Number(match[2])
  if (week < 1 || week > 53) return null
  const januaryFourth = new Date(Date.UTC(year, 0, 4))
  const januaryFourthDay = januaryFourth.getUTCDay() || 7
  const monday = new Date(januaryFourth)
  monday.setUTCDate(januaryFourth.getUTCDate() - januaryFourthDay + 1 + ((week - 1) * 7))
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return { from: utcDateValue(monday), to: utcDateValue(sunday) }
}

function escapeHtml(value: unknown) {
  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(new Date(`${value}T00:00:00+08:00`))
}

export function reportPeriodLabel(range: ReportRange) {
  return range.from === range.to ? formatDate(range.from) : `${formatDate(range.from)} – ${formatDate(range.to)}`
}

interface BuildReportOptions {
  records: GuestbookVisit[]
  range: ReportRange
  scopeName: string
  generatedBy: string
  generatedAt: string
  logoKonselUrl: string
}

export function buildGuestbookReportHtml({
  records,
  range,
  scopeName,
  generatedBy,
  generatedAt,
  logoKonselUrl,
}: BuildReportOptions) {
  const internalTotal = records.filter((item) => item.visitor_type === "internal").length
  const externalAsnTotal = records.filter((item) => item.visitor_type === "external_employee").length
  const generalTotal = records.filter((item) => item.visitor_type === "external_general").length
  const activeTotal = records.filter((item) => item.status === "checked_in").length

  const rows = records.map((visit, index) => {
    const origins = [visit.origin_institution, visit.office_name]
      .filter((value, itemIndex, values) => value && values.indexOf(value) === itemIndex)
      .join(" / ") || "-"
    const gender = visit.gender === "L" ? "Laki-laki" : visit.gender === "P" ? "Perempuan" : "-"
    const nipLine = visit.nip ? `<br><span>NIP: ${escapeHtml(visit.nip)}</span>` : ""
    return `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${escapeHtml(formatDateTime(visit.checked_in_at))}</td>
        <td><b>${escapeHtml(visit.visitor_name)}</b><br><span>${escapeHtml(visitorTypeLabel[visit.visitor_type])} · ${escapeHtml(gender)}</span>${nipLine}</td>
        <td>${escapeHtml(origins)}</td>
        <td>${escapeHtml(visit.position_name || "-")}</td>
        <td>${escapeHtml(visit.phone || "-")}</td>
        <td>${escapeHtml(visit.purpose)}</td>
        <td class="center">${visit.status === "completed" ? "Selesai" : "Berkunjung"}</td>
      </tr>`
  }).join("")

  return `<!doctype html>
  <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Buku Tamu - ${escapeHtml(reportPeriodLabel(range))}</title>
      <style>
        @page { size: A4 landscape; margin: 9mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #172033; font-family: Arial, Helvetica, sans-serif; font-size: 8pt; }
        .letterhead { display: grid; grid-template-columns: 78px 1fr 78px; align-items: center; min-height: 72px; padding: 0 10px 5px; color: #000; }
        .letterhead-logo { display: flex; justify-content: center; }
        .letterhead-logo img { width: 58px; height: 68px; object-fit: contain; }
        .letterhead-copy { text-align: center; font-family: "Times New Roman", Times, serif; }
        .letterhead-copy h1 { margin: 0; font-size: 18pt; font-weight: 800; line-height: 1.05; letter-spacing: .15px; }
        .letterhead-copy h2 { margin: 3px 0 0; font-size: 15pt; font-weight: 800; line-height: 1.08; text-transform: uppercase; }
        .letterhead-copy p { margin: 4px 0 0; font-size: 9pt; line-height: 1.15; }
        .letterhead-copy a { color: #000; text-decoration: none; }
        .letterhead-rule { height: 5px; margin-top: 2px; border-top: 3px solid #000; border-bottom: 1px solid #000; }
        .report-title { padding-top: 8px; text-align: center; }
        .report-title h3 { margin: 0; font-size: 12pt; text-decoration: underline; text-underline-offset: 3px; }
        .report-title p { margin: 4px 0 0; color: #334155; font-size: 8pt; }
        .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 10px 0; }
        .summary div { border: 1px solid #dbe5df; border-radius: 6px; background: #f0fdf4; padding: 6px 8px; }
        .summary span { display: block; color: #64748b; font-size: 7pt; }
        .summary b { display: block; margin-top: 2px; color: #065f46; font-size: 12pt; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        th, td { border: 1px solid #cbd5e1; padding: 4px; vertical-align: top; overflow-wrap: anywhere; line-height: 1.3; }
        th { background: #065f46; color: #fff; font-size: 7pt; text-align: left; }
        td span { color: #475569; font-size: 7pt; }
        .center { text-align: center; }
        .empty { padding: 28px; text-align: center; color: #64748b; }
        .footer-note { margin-top: 7px; color: #64748b; font-size: 7pt; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <header>
        <div class="letterhead">
          <div class="letterhead-logo"><img src="${escapeHtml(logoKonselUrl)}" alt="Logo Kabupaten Konawe Selatan"></div>
          <div class="letterhead-copy">
            <h1>PEMERINTAH KABUPATEN KONAWE SELATAN</h1>
            <h2>${escapeHtml(scopeName)}</h2>
            <p>Jl. Poros Andoolo Kompleks Perkantoran I &nbsp;|&nbsp; <a href="https://www.konaweselatankab.go.id">www.konaweselatankab.go.id</a></p>
          </div>
          <div></div>
        </div>
        <div class="letterhead-rule"></div>
        <div class="report-title"><h3>LAPORAN BUKU TAMU DIGITAL</h3><p>Periode ${escapeHtml(reportPeriodLabel(range))}</p></div>
      </header>
      <section class="summary">
        <div><span>Total Kunjungan</span><b>${records.length}</b></div>
        <div><span>ASN Konsel</span><b>${internalTotal}</b></div>
        <div><span>ASN</span><b>${externalAsnTotal}</b></div>
        <div><span>Non ASN / Umum</span><b>${generalTotal}</b></div>
        <div><span>Sedang Berkunjung</span><b>${activeTotal}</b></div>
      </section>
      <table>
        <colgroup><col style="width:3%"><col style="width:9%"><col style="width:18%"><col style="width:17%"><col style="width:13%"><col style="width:10%"><col style="width:22%"><col style="width:8%"></colgroup>
        <thead><tr><th>No.</th><th>Waktu Datang</th><th>Identitas Tamu</th><th>Instansi / Kantor</th><th>Jabatan</th><th>Nomor HP</th><th>Urusan / Keperluan</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" class="empty">Tidak ada kunjungan pada periode ini.</td></tr>'}</tbody>
      </table>
      <p class="footer-note">Dicetak oleh ${escapeHtml(generatedBy)} pada ${escapeHtml(formatDateTime(generatedAt))} WITA · Konsel Setara</p>
      <script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 350); });<\/script>
    </body>
  </html>`
}

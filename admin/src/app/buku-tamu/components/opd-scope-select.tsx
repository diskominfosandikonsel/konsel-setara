import { Building2 } from "lucide-react"
import type { OpdOption } from "../types"
import { SearchableSelect } from "./searchable-select"

interface OpdScopeSelectProps {
  value: string
  options: OpdOption[]
  onChange: (value: string) => void
  allowAll?: boolean
  label?: string
}

export function OpdScopeSelect({
  value,
  options,
  onChange,
  allowAll = true,
  label = "Lingkup OPD",
}: OpdScopeSelectProps) {
  return (
    <label className="grid w-full min-w-0 gap-1.5 text-sm sm:w-auto">
      <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
        <Building2 className="size-4" /> {label}
      </span>
      <SearchableSelect
        value={value}
        onValueChange={onChange}
        placeholder="Pilih OPD..."
        searchPlaceholder="Cari nama OPD..."
        emptyText="OPD tidak ditemukan."
        className="w-full sm:min-w-64"
        options={[
          { value: "", label: allowAll ? "Semua OPD" : "Pilih OPD..." },
          ...options.map((item) => ({
            value: String(item.id),
            label: item.instansi,
            keywords: String(item.id),
          })),
        ]}
      />
    </label>
  )
}

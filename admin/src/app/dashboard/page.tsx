import { BaseLayout } from "@/components/layouts/base-layout"
import { SkmSummaryCards } from "./components/skm-summary-cards"
import { SkmTrendChart } from "./components/skm-trend-chart"
import { SkmCategoryChart } from "./components/skm-category-chart"
import { SkmRecentReviews } from "./components/skm-recent-reviews"
import { AuthGuard } from "@/components/auth-guard"

export default function Page() {
  return (
    <AuthGuard>
      <BaseLayout title="Dashboard SKM" description="Survei Kepuasan Masyarakat — Kabupaten Konawe Selatan">
        <div className="px-4 lg:px-6 space-y-6">
          <SkmSummaryCards />
          <div className="grid gap-4 @xl/main:grid-cols-2">
            <SkmTrendChart />
            <SkmCategoryChart />
          </div>
          <SkmRecentReviews />
        </div>
      </BaseLayout>
    </AuthGuard>
  )
}

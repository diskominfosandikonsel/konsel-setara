export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="px-4 py-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Pemerintah Kabupaten Konawe Selatan. Hak Cipta Dilindungi.</p>
          <p>Admin Panel — Konsel Setara</p>
        </div>
      </div>
    </footer>
  )
}

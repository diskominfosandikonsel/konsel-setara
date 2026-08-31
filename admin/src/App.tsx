import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { AppRouter } from '@/components/router/app-router'
import { useEffect } from 'react'
import { initGTM } from '@/utils/analytics'

// Setup TanStack Query Client with optimal caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit cache
      gcTime: 1000 * 60 * 30,   // 30 menit simpan di memory
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''

function App() {
  // Initialize GTM on app load
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <SidebarConfigProvider>
            <Router basename={basename}>
              <AppRouter />
            </Router>
          </SidebarConfigProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  )
}

export default App

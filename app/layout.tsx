import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { GarageStoreProvider } from '@/lib/store/garage-store'
import { Toaster } from 'sonner'
import { DemoBar } from '@/components/layout/demo-bar'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
})

const fontPlate = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-plate',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1120' },
  ],
}

export const metadata: Metadata = {
  title: 'GARA AUTO — Tra Cứu & Quản Lý Bảo Hành Ô Tô',
  description: 'Hệ thống Quản lý và Tra cứu bảo hành điện tử chính hãng dành cho gara và khách hàng.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${fontSans.variable} ${fontPlate.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col selection:bg-primary/20 selection:text-primary">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <GarageStoreProvider>
            <DemoBar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster richColors position="top-center" closeButton duration={3500} />
          </GarageStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

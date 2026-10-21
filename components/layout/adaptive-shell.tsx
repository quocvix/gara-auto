'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { AdminHeader } from './admin-header'
import { TicketModalProvider } from '@/components/domain/ticket-modal'

export function AdaptiveShell({ children }: { children: React.ReactNode }) {
  return (
    <TicketModalProvider>
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#E1E7EF] text-slate-900 force-light relative selection:bg-blue-600/10 selection:text-blue-600">
        {/* Slate Muted Tech Canvas - Tông nền tương phản giúp nổi bật các card trắng */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: '#e1e7ef',
            backgroundImage: `
              radial-gradient(
                circle at top right,
                rgba(59, 130, 246, 0.14),
                transparent 60%
              ),
              radial-gradient(
                circle at 10% 80%,
                rgba(99, 102, 241, 0.08),
                transparent 50%
              ),
              radial-gradient(
                circle at 80% 50%,
                rgba(16, 185, 129, 0.05),
                transparent 45%
              )
            `,
            filter: 'blur(50px)',
            backgroundRepeat: 'no-repeat',
          }}
          aria-hidden="true"
        />

        {/* Desktop Sidebar (>= 1024px) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
          {/* Header Mobile & Tablet */}
          <AdminHeader />

          {/* Page Content */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation (< 1024px) */}
        <BottomNav />
      </div>
    </TicketModalProvider>
  )
}

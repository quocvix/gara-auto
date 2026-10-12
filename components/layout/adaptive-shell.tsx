'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { AdminHeader } from './admin-header'
import { TicketModalProvider } from '@/components/domain/ticket-modal'

export function AdaptiveShell({ children }: { children: React.ReactNode }) {
  return (
    <TicketModalProvider>
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100/70 text-slate-900 force-light relative selection:bg-blue-600/10 selection:text-blue-600">
        {/* PatternCraft: Cool Blue Glow Right - Tông nền Slate Automotive Tech chống chói và giảm bớt flat trắng */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: '#f1f5f9',
            backgroundImage: `
              radial-gradient(
                circle at top right,
                rgba(59, 130, 246, 0.15),
                transparent 65%
              ),
              radial-gradient(
                circle at 20% 80%,
                rgba(30, 58, 138, 0.08),
                transparent 50%
              )
            `,
            filter: 'blur(60px)',
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

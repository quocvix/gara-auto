'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { AdminHeader } from './admin-header'
import { TicketModalProvider } from '@/components/domain/ticket-modal'

export function AdaptiveShell({ children }: { children: React.ReactNode }) {
  return (
    <TicketModalProvider>
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 force-light">
        {/* Desktop Sidebar (>= 1024px) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-8">
          {/* Header Mobile & Tablet */}
          <AdminHeader />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation (< 1024px) */}
        <BottomNav />
      </div>
    </TicketModalProvider>
  )
}

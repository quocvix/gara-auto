'use client'

import React from 'react'
import { AdaptiveShell } from '@/components/layout/adaptive-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdaptiveShell>{children}</AdaptiveShell>
}

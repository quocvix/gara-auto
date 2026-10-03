'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Wrench, Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

export default function LoginPage() {
  const router = useRouter()
  const { loginAdmin, settings } = useGarageStore()
  const { trigger } = useHaptic()

  const [email, setEmail] = useState('chu-xuong@example.com')
  const [password, setPassword] = useState('gara-secret-2026')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    trigger('success')
    loginAdmin()
    toast.success('Đăng nhập Quản Trị Viên thành công!')
    router.push('/admin')
  }

  const handleQuickLogin = () => {
    trigger('success')
    loginAdmin()
    toast.success('Đăng nhập nhanh 1-Click thành công!')
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 border-b border-border bg-card/70 flex items-center justify-between">
        <a href="/tra-cuu" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <Wrench className="w-4 h-4 text-primary" />
          <span>{settings.name || 'GARA AUTO'}</span>
        </a>
        <ThemeToggle />
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Đăng Nhập Quản Trị</h2>
            <p className="text-xs text-muted-foreground">
              Khu vực dành cho chủ xưởng và kỹ thuật viên quản lý hồ sơ xe & kho phụ tùng
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  EMAIL QUẢN TRỊ
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  MẬT KHẨU
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="touch-target w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-98 transition-all"
              >
                <span>Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-border" />
              <span className="bg-card px-2 text-[11px] text-muted-foreground uppercase font-semibold absolute">
                HOẶC XEM THỬ NGAY
              </span>
            </div>

            {/* Nút 1-Click Fast Login cho bản Preview */}
            <button
              type="button"
              onClick={handleQuickLogin}
              className="touch-target w-full h-12 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>1-Click Đăng Nhập Nhanh Vào Admin</span>
            </button>
          </div>

          <div className="text-center">
            <a
              href="/tra-cuu"
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              Quay lại trang tra cứu bảo hành của khách
            </a>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border">
        {settings.name} — Hệ thống quản trị nội bộ
      </footer>
    </div>
  )
}

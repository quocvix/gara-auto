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
    <div className="force-light min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
        <a href="/tra-cuu" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <Wrench className="w-4 h-4 text-blue-600" />
          <span>{settings.name || 'GARA AUTO'}</span>
        </a>
        <a
          href="/tra-cuu"
          className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          Trang tra cứu
        </a>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đăng Nhập Quản Trị</h2>
            <p className="text-xs text-slate-500">
              Khu vực dành cho chủ xưởng và kỹ thuật viên quản lý hồ sơ xe & kho phụ tùng
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-xl bg-white border border-slate-200 shadow-sm space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  EMAIL QUẢN TRỊ
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  MẬT KHẨU
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Đăng Nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-slate-200" />
              <span className="bg-white px-2 text-[10px] text-slate-400 uppercase font-semibold absolute">
                HOẶC XEM THỬ NGAY
              </span>
            </div>

            {/* Nút 1-Click Fast Login cho bản Preview */}
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full h-10 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Zap className="w-4 h-4 text-amber-600 fill-current" />
              <span>1-Click Đăng Nhập Nhanh Vào Admin</span>
            </button>
          </div>

          <div className="text-center">
            <a
              href="/tra-cuu"
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors underline"
            >
              Quay lại trang tra cứu bảo hành của khách
            </a>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        {settings.name} — Hệ thống quản trị nội bộ
      </footer>
    </div>
  )
}

'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGarageStore } from '@/lib/store/garage-store'
import { Wrench, Lock, Mail, ArrowRight, ShieldCheck, Zap, UserPlus, Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useHaptic } from '@/hooks/use-haptic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/admin'

  const { loginWithSupabase, signUpWithSupabase, settings } = useGarageStore()
  const { trigger } = useHaptic()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('admin@duyauto.vn')
  const [password, setPassword] = useState('Admin@123456')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const translateAuthError = (msg?: string) => {
    if (!msg) return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
    if (msg.includes('Invalid login credentials')) return 'Email hoặc mật khẩu không chính xác.'
    if (msg.includes('User already registered')) return 'Email này đã tồn tại trong hệ thống.'
    if (msg.includes('Password should be at least')) return 'Mật khẩu phải có ít nhất 6 ký tự.'
    if (msg.includes('Email not confirmed')) return 'Email chưa được xác thực.'
    return msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    if (mode === 'login') {
      const res = await loginWithSupabase(email, password)
      setLoading(false)
      if (res.ok) {
        trigger('success')
        toast.success('Đăng nhập Quản Trị Viên thành công!')
        router.push(redirectTarget)
      } else {
        trigger('error')
        const msg = translateAuthError(res.error)
        setErrorMessage(msg)
        toast.error(msg)
      }
    } else {
      const res = await signUpWithSupabase(email, password)
      setLoading(false)
      if (res.ok) {
        trigger('success')
        toast.success('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.')
        setMode('login')
      } else {
        trigger('error')
        const msg = translateAuthError(res.error)
        setErrorMessage(msg)
        toast.error(msg)
      }
    }
  }

  const handleQuickLogin = async () => {
    setEmail('admin@duyauto.vn')
    setPassword('Admin@123456')
    setErrorMessage(null)
    setLoading(true)
    const res = await loginWithSupabase('admin@duyauto.vn', 'Admin@123456')
    setLoading(false)
    if (res.ok) {
      trigger('success')
      toast.success('Đăng nhập Quản Trị Viên Duy Auto thành công!')
      router.push(redirectTarget)
    } else {
      trigger('error')
      const msg = translateAuthError(res.error)
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {mode === 'login' ? 'Đăng Nhập Quản Trị' : 'Đăng Ký Quản Trị Viên'}
        </h2>
        <p className="text-xs text-slate-500">
          Khu vực bảo mật dành cho chủ gara và kỹ thuật viên quản lý hồ sơ xe & phụ tùng
        </p>
      </div>

      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        {/* Chuyển đổi Đăng nhập / Đăng ký */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setErrorMessage(null)
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              mode === 'login'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setErrorMessage(null)
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
            {errorMessage}
          </div>
        )}

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
                placeholder="admin@duyauto.vn"
                disabled={loading}
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-xs disabled:opacity-60"
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
                placeholder="••••••••"
                disabled={loading}
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý qua Supabase...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Đăng Nhập Quản Trị</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Tạo Tài Khoản Quản Trị</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center pt-2">
          <span className="w-full border-t border-slate-200" />
          <span className="bg-white px-2.5 text-[10px] text-slate-400 uppercase font-semibold absolute">
            TÀI KHOẢN MẪU SUPABASE
          </span>
        </div>

        {/* Nút 1-Click Fast Login cho tài khoản Admin đã tạo */}
        <button
          type="button"
          onClick={handleQuickLogin}
          disabled={loading}
          className="w-full p-3 rounded-xl bg-blue-50/70 hover:bg-blue-50 border border-blue-200/90 text-slate-800 text-left transition-all shadow-2xs hover:border-blue-300 group cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 fill-current" />
              <span className="font-semibold text-xs text-blue-900">
                1-Click Đăng nhập tài khoản mặc định
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-100 shadow-2xs">
              Supabase Auth
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-2xs text-slate-500 font-mono">
            <span>Email: <strong className="text-slate-700">admin@duyauto.vn</strong></span>
            <span>•</span>
            <span>Mật khẩu: <strong className="text-slate-700">Admin@123456</strong></span>
          </div>
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
  )
}

export default function LoginPage() {
  const { settings } = useGarageStore()

  return (
    <div className="force-light min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
        <a href="/tra-cuu" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <Wrench className="w-4 h-4 text-blue-600" />
          <span>{settings.name || 'Duy Auto'}</span>
        </a>
        <a
          href="/tra-cuu"
          className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          Trang tra cứu
        </a>
      </header>

      {/* Main Form wrapped in Suspense for Next.js App Router */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        {settings.name || 'Duy Auto'} — Hệ thống quản trị gara ô tô trực tuyến với Supabase
      </footer>
    </div>
  )
}

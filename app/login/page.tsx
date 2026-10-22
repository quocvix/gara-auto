"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import Link from "next/link";
import Image from "next/image";
import { useGarageStore } from "@/lib/store/garage-store";
import { User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";

function LoginForm() {
    const router = useRouter();
    const [redirectTarget] = useQueryState("redirect", parseAsString.withDefault("/admin"));

    const { loginWithSupabase, settings } = useGarageStore();
    const { trigger } = useHaptic();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const translateAuthError = (msg?: string) => {
        if (!msg) return "Đã có lỗi xảy ra. Vui lòng thử lại.";
        if (msg.includes("Invalid login credentials")) return "Tên đăng nhập hoặc mật khẩu không chính xác.";
        if (msg.includes("User not found")) return "Tài khoản không tồn tại trong hệ thống.";
        if (msg.includes("Password should be at least")) return "Mật khẩu phải có ít nhất 6 ký tự.";
        if (msg.includes("Email not confirmed")) return "Tài khoản chưa được xác thực.";
        return msg;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        const cleanUsername = username.trim();
        if (!cleanUsername) {
            trigger("error");
            setErrorMessage("Vui lòng nhập tên đăng nhập.");
            return;
        }

        if (!password) {
            trigger("error");
            setErrorMessage("Vui lòng nhập mật khẩu.");
            return;
        }

        trigger("tap");
        setLoading(true);

        const res = await loginWithSupabase(cleanUsername, password);
        setLoading(false);

        if (res.ok) {
            trigger("success");
            toast.success("Đăng nhập Quản Trị Viên thành công!");
            router.push(redirectTarget);
        } else {
            trigger("error");
            const msg = translateAuthError(res.error);
            setErrorMessage(msg);
            toast.error(msg);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6">
            {/* Brand Hero Header */}
            <div className="text-center space-y-2">
                <div className="relative flex justify-center items-center pb-1">
                    {/* Ambient Aura Glow */}
                    <div
                        className="pointer-events-none absolute w-40 h-20 sm:w-56 sm:h-28 rounded-full bg-blue-500/20 blur-2xl -z-10"
                        aria-hidden="true"
                    />
                    <Image
                        src="/logo-duy-auto-remove-bg-v1.png"
                        alt={settings.name || "Duy Auto Logo"}
                        width={320}
                        height={130}
                        priority
                        className="h-16 sm:h-20 w-auto object-contain drop-shadow-xs transition-transform duration-300"
                    />
                </div>

                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Đăng Nhập</h1>
                </div>
            </div>

            {/* Main Login Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-blue-200/90 shadow-xl shadow-blue-600/10 ring-1 ring-blue-500/15 overflow-hidden transition-all">
                <div className="p-4 sm:p-6 sm:p-7 space-y-4 bg-linear-to-b from-blue-50/40 via-white to-white">
                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-150">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed flex-1">{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tên đăng nhập */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="username"
                                className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between"
                            >
                                <span className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <User className="w-3 h-3 stroke-[2.5]" />
                                    </span>
                                    <span>Tài khoản / Email</span>
                                </span>
                                {username.trim().length > 0 && !username.includes("@") && (
                                    <span className="text-[10px] text-blue-600 font-mono font-semibold bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded-md">
                                        → {username.trim()}@gmail.com
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Nhập tên tài khoản (VD: admin)"
                                    disabled={loading}
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    enterKeyHint="next"
                                    className="w-full h-11 sm:h-12 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-medium transition-all disabled:opacity-60"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 pl-0.5">
                                <span>Chỉ cần nhập tên tài khoản, hệ thống sẽ tự thêm</span>
                                <span className="font-mono font-bold text-slate-600">@gmail.com</span>
                            </p>
                        </div>

                        {/* Mật khẩu */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
                            >
                                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Lock className="w-3 h-3 stroke-[2.5]" />
                                </span>
                                <span>Mật khẩu</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="current-password"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    enterKeyHint="go"
                                    className="w-full h-11 sm:h-12 pl-10 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs transition-all disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        trigger("tap");
                                        setShowPassword((prev) => !prev);
                                    }}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="touch-target w-full h-11 sm:h-12 rounded-xl bg-linear-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    <span>Đang xác thực...</span>
                                </>
                            ) : (
                                <>
                                    <span>Đăng Nhập Quản Trị</span>
                                    <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Back to public lookup link */}
            <div className="text-center pt-1">
                <Link
                    href="/tra-cuu"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-white/80 active:scale-95"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại trang tra cứu bảo hành</span>
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const { settings } = useGarageStore();

    return (
        <div className="force-light min-h-svh sm:min-h-dvh w-full text-slate-900 flex flex-col justify-between selection:bg-blue-600/10 selection:text-blue-600 relative overflow-x-hidden overscroll-y-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* PatternCraft Ambient Background (đồng bộ với trang tra cứu) */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: "#ffffff",
                    backgroundImage: `
            radial-gradient(
              circle at top right,
              rgba(70, 130, 180, 0.45),
              transparent 70%
            ),
            radial-gradient(
              circle at 20% 80%,
              rgba(70, 130, 180, 0.15),
              transparent 50%
            )
          `,
                    filter: "blur(80px)",
                    backgroundRepeat: "no-repeat",
                }}
                aria-hidden="true"
            />

            {/* Top Bar Navigation */}
            <header className="relative z-10 px-4 sm:px-6 py-2 flex items-center justify-between">
                <Link
                    href="/tra-cuu"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tra cứu</span>
                </Link>

                <span className="text-xs font-bold text-slate-500 font-mono">{settings.name || "Duy Auto"}</span>
            </header>

            {/* Main Content Form */}
            <main className="relative z-10 flex-1 flex flex-col justify-center px-4 py-3 sm:py-6 w-full max-w-md mx-auto">
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
        </div>
    );
}

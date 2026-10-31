"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGarageStore } from "@/lib/store/garage-store";
import { normalizePlate, sanitizePlateInput, formatPlateDisplay } from "@/lib/plate";
import { ArrowRight, X, ArrowUpRight, Search } from "lucide-react";
import { GarageSupportActions } from "@/components/domain/garage-support-actions";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";

const RECENT_PLATES_KEY = "gara_recent_plates_v1";

export default function TraCuuPage() {
    const router = useRouter();
    const settings = useGarageStore((s) => s.settings);
    const { trigger } = useHaptic();

    const [inputPlate, setInputPlate] = useState("");
    const [recentPlates, setRecentPlates] = useState<string[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(RECENT_PLATES_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setRecentPlates(parsed.slice(0, 4));
                }
            }
        } catch {
            // ignore
        }
    }, []);

    const saveRecentPlate = (norm: string) => {
        try {
            const updated = [norm, ...recentPlates.filter((p) => p !== norm)].slice(0, 4);
            setRecentPlates(updated);
            localStorage.setItem(RECENT_PLATES_KEY, JSON.stringify(updated));
        } catch {
            // ignore
        }
    };

    const handleClearRecent = () => {
        try {
            localStorage.removeItem(RECENT_PLATES_KEY);
            setRecentPlates([]);
        } catch {
            // ignore
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const norm = normalizePlate(inputPlate);
        if (norm.length < 5) {
            trigger("error");
            toast.error("Vui lòng nhập biển số xe hợp lệ (tối thiểu 5 ký tự)");
            return;
        }
        trigger("tap");
        saveRecentPlate(norm);
        router.push(`/tra-cuu/${norm}`);
    };

    const handleQuickPick = (plateNorm: string) => {
        trigger("tap");
        saveRecentPlate(plateNorm);
        router.push(`/tra-cuu/${plateNorm}`);
    };

    return (
        <div className="force-light min-h-svh sm:min-h-dvh w-full text-slate-900 flex flex-col justify-center selection:bg-blue-600/10 selection:text-blue-600 relative overflow-x-hidden overscroll-y-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* PatternCraft: Cool Blue Glow Right */}
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

            {/* Main Content: Tối ưu hoá đặc biệt cho Mobile (vừa vặn hoàn hảo trong 100svh, không bị cuộn thừa) */}
            <main className="relative z-10 flex-1 flex flex-col justify-center px-4 py-1.5 sm:py-6 w-full max-w-md mx-auto space-y-2.5 sm:space-y-4">
                {/* Brand Hero Mobile Header: Logo nổi bật với hiệu ứng Ambient Aura */}
                <div className="text-center space-y-1">
                    <div className="relative flex justify-center items-center pb-1 sm:pb-2">
                        {/* Quầng sáng ambient hào quang phía sau logo */}
                        <div
                            className="pointer-events-none absolute w-52 h-24 sm:w-64 sm:h-32 rounded-full bg-blue-500/20 blur-2xl -z-10"
                            aria-hidden="true"
                        />
                        <Image
                            src="/logo-duy-auto-remove-bg-v1.png"
                            alt={settings.name || "Duy Auto Logo"}
                            width={360}
                            height={145}
                            priority
                            className="h-24 sm:h-32 w-auto object-contain drop-shadow-md transition-transform hover:scale-105 duration-300"
                        />
                    </div>
                </div>

                {/* Card Nhập Biển Số Xe */}
                <div className="rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden transition-all">
                    <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-linear-to-b from-blue-50/40 via-white to-white">
                        <form onSubmit={handleSearch} className="space-y-5">
                            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight text-center text-balance">
                                Tra Cứu Bảo Hành
                            </h1>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="plate-input"
                                        className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
                                    >
                                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Search className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                                        </span>
                                        <span>Biển số xe</span>
                                    </label>
                                </div>

                                {/* Khung Input Phong Cách Biển Số Xe */}
                                <div className="relative">
                                    <input
                                        id="plate-input"
                                        name="plate"
                                        type="text"
                                        value={inputPlate}
                                        onChange={(e) => setInputPlate(sanitizePlateInput(e.target.value))}
                                        placeholder="VD: 51K-889.99 hoặc 51K88999…"
                                        autoCapitalize="characters"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        enterKeyHint="search"
                                        autoFocus
                                        className="w-full h-11 sm:h-12 px-3.5 pr-11 rounded-xl border border-slate-300 bg-slate-50/70 font-mono text-base sm:text-lg font-bold uppercase tabular-nums text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all text-center shadow-2xs"
                                        style={{
                                            fontFamily: "var(--font-plate), monospace",
                                        }}
                                    />
                                    {inputPlate && (
                                        <button
                                            type="button"
                                            onClick={() => setInputPlate("")}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                            aria-label="Xóa biển số đã nhập"
                                            title="Xóa biển số"
                                        >
                                            <X className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Nút Submit Chính (Touch Target chuẩn, gradient sắc nét) */}
                            <button
                                type="submit"
                                className="touch-target w-full h-11 sm:h-12 rounded-xl bg-linear-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                            >
                                <span>Tra Cứu Thông Tin</span>
                                <ArrowRight className="w-4 h-4 stroke-[2.5] ml-0.5" />
                            </button>
                        </form>

                        {/* Lịch sử tra cứu gần đây */}
                        {recentPlates.length > 0 ? (
                            <div className="pt-2 border-t border-blue-100/70 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span className="font-semibold uppercase tracking-wider text-slate-500">
                                        Đã tra gần đây
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleClearRecent}
                                        className="hover:text-blue-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
                                    >
                                        Xóa lịch sử
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {recentPlates.map((plate) => (
                                        <button
                                            key={plate}
                                            type="button"
                                            onClick={() => handleQuickPick(plate)}
                                            className="inline-flex items-center gap-1 min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-blue-50 hover:text-blue-900 text-slate-700 font-mono font-semibold text-xs tabular-nums border border-slate-200 hover:border-blue-300 transition-all active:scale-95 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                        >
                                            <span>{formatPlateDisplay(plate)}</span>
                                            <ArrowUpRight className="w-3 h-3 text-blue-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Hotline & Zalo Cứu Hộ / Hỗ Trợ Gara (Dạng inline gọn gàng, tiết kiệm chiều cao) */}
                <GarageSupportActions hotline={settings.hotline} variant="inline" className="mt-1 sm:mt-2" />
            </main>
        </div>
    );
}

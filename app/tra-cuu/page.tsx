"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGarageStore } from "@/lib/store/garage-store";
import {
    normalizePlate,
    sanitizePlateInput,
    formatPlateDisplay,
} from "@/lib/plate";
import {
    Phone,
    ArrowRight,
    X,
    ArrowUpRight,
    ShieldCheck,
    Search,
    Zap,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";

const RECENT_PLATES_KEY = "gara_recent_plates_v1";

export default function TraCuuPage() {
    const router = useRouter();
    const { settings } = useGarageStore();
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

    // Khóa hoàn toàn scroll Y của document/body trên mobile Chrome khi ở màn tra cứu
    useEffect(() => {
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
        };
    }, []);

    const saveRecentPlate = (norm: string) => {
        try {
            const updated = [
                norm,
                ...recentPlates.filter((p) => p !== norm),
            ].slice(0, 4);
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
        <div className="force-light fixed inset-0 w-full h-full bg-white text-slate-900 flex flex-col justify-center selection:bg-blue-600/10 selection:text-blue-600 overflow-hidden overscroll-none">
            {/* PatternCraft: Cool Blue Glow Right */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
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

            {/* Main Content: Tối ưu hoá đặc biệt cho Mobile (nổi trên nền z-10) */}
            <main className="relative z-10 flex-1 flex flex-col justify-center px-4 pt-2 sm:pt-4 pb-14 sm:pb-16 w-full max-w-md mx-auto space-y-2 sm:space-y-3.5">
                {/* Brand Hero Mobile Header (Thay thế thanh top header cứng nhắc) */}
                <div className="text-center space-y-1 sm:space-y-1.5">
                    <div className="flex justify-center items-center pb-0 sm:pb-1">
                        <Image
                            src="/logo-duy-auto-remove-bg-v1.png"
                            alt={settings.name || "Duy Auto Logo"}
                            width={360}
                            height={145}
                            priority
                            className="h-32 sm:h-36 w-auto object-contain drop-shadow-xs"
                        />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-2xs sm:text-xs font-semibold shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Sổ Bảo Hành Điện Tử</span>
                    </div>

                    <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900">
                        Tra Cứu Hồ Sơ Xe
                    </h1>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Nhập biển số để kiểm tra thời hạn bảo hành &amp; phụ
                        tùng
                    </p>
                </div>

                {/* Card Nhập Biển Số Xe */}
                <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm shadow-slate-200/60 overflow-hidden">
                    {/* Dải line màu thương hiệu trên đỉnh thẻ */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

                    <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                        <form onSubmit={handleSearch} className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="plate-input"
                                        className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5"
                                    >
                                        <Search className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Biển số xe</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        VD: 51K-889.99 hoặc 51K88999
                                    </span>
                                </div>

                                {/* Khung Input Phong Cách Biển Số Xe */}
                                <div className="relative group">
                                    <input
                                        id="plate-input"
                                        type="text"
                                        value={inputPlate}
                                        onChange={(e) =>
                                            setInputPlate(
                                                sanitizePlateInput(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="51K-889.99"
                                        autoCapitalize="characters"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        enterKeyHint="search"
                                        autoFocus
                                        className="w-full h-11 sm:h-12 px-3.5 pr-10 rounded-xl border-2 border-slate-200 bg-slate-50/70 font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 placeholder:text-slate-300 placeholder:font-mono placeholder:font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-center"
                                        style={{
                                            fontFamily:
                                                "var(--font-plate), monospace",
                                        }}
                                    />
                                    {inputPlate && (
                                        <button
                                            type="button"
                                            onClick={() => setInputPlate("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 active:scale-90 transition-all cursor-pointer"
                                            title="Xóa biển số"
                                        >
                                            <X className="w-4 h-4 stroke-[2.5]" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Nút Submit Chính (Touch Target lớn, màu sắc bắt mắt) */}
                            <button
                                type="submit"
                                className="touch-target w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                            >
                                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                                <span>Tra Cứu Thông Tin</span>
                                <ArrowRight className="w-4 h-4 stroke-[2.2] ml-0.5" />
                            </button>
                        </form>

                        {/* Lịch sử tra cứu gần đây (Recent Searches) hoặc Gợi ý biển số */}
                        {recentPlates.length > 0 ? (
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                <div className="flex items-center justify-between text-2xs text-slate-400">
                                    <span className="font-semibold uppercase tracking-wider">
                                        Đã tra gần đây
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleClearRecent}
                                        className="hover:text-slate-600 transition-colors cursor-pointer"
                                    >
                                        Xóa lịch sử
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {recentPlates.map((plate) => (
                                        <button
                                            key={plate}
                                            type="button"
                                            onClick={() =>
                                                handleQuickPick(plate)
                                            }
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50/70 text-slate-700 hover:text-blue-700 font-mono font-medium text-xs border border-slate-200/90 hover:border-blue-200 transition-all active:scale-95 cursor-pointer"
                                        >
                                            <span>
                                                {formatPlateDisplay(plate)}
                                            </span>
                                            <ArrowUpRight className="w-3 h-3 text-slate-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-slate-400">
                                    Biển số mẫu:
                                </span>
                                <div className="flex gap-1.5">
                                    {["51K88999", "30G12345"].map((sample) => (
                                        <button
                                            key={sample}
                                            type="button"
                                            onClick={() =>
                                                handleQuickPick(sample)
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50/80 text-slate-600 hover:text-blue-700 font-mono text-xs font-semibold border border-slate-200/80 transition-all active:scale-95 cursor-pointer"
                                        >
                                            {formatPlateDisplay(sample)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3 Lợi ích / Micro-Features trên Mobile */}
                {/* <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs">
                        <Zap className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5 stroke-[2]" />
                        <p className="text-[11px] font-bold text-slate-700">
                            Tức thì
                        </p>
                        <p className="text-[10px] text-slate-400">
                            Không cần login
                        </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mx-auto mb-0.5 stroke-[2]" />
                        <p className="text-[11px] font-bold text-slate-700">
                            Chính hãng
                        </p>
                        <p className="text-[10px] text-slate-400">
                            Bảo hành phụ tùng
                        </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5 stroke-[2]" />
                        <p className="text-[11px] font-bold text-slate-700">
                            24/7
                        </p>
                        <p className="text-[10px] text-slate-400">
                            Tra cứu mọi lúc
                        </p>
                    </div>
                </div> */}

                {/* Hotline Cứu Hộ / Trợ Giúp Nhanh */}
                {settings.hotline && (
                    <a
                        href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                        className="mt-2 sm:mt-3 touch-target inline-flex items-center justify-center gap-1.5 w-full py-1.5 sm:py-2 px-3 rounded-xl border border-red-200/80 bg-red-50/70 hover:bg-red-50 active:scale-[0.99] text-red-600 text-xs font-semibold transition-all shadow-2xs"
                    >
                        <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span>
                            Cần hỗ trợ? Gọi Hotline:{" "}
                            <strong>{settings.hotline}</strong>
                        </span>
                    </a>
                )}
            </main>

            {/* Footer cố định sát đáy màn hình (Fixed bottom footer) */}
            <footer className="fixed bottom-0 inset-x-0 z-20 w-full border-t border-slate-200/80 bg-white/85 backdrop-blur-md py-2 sm:py-2.5 px-4 text-center text-xs text-slate-400 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-xs">
                <div className="max-w-md mx-auto space-y-1">
                    <p className="font-medium text-slate-500">
                        Hệ thống bảo hành • Duy.lamxedao.thuduc
                    </p>
                </div>
            </footer>
        </div>
    );
}

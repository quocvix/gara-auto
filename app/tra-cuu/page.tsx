"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    HelpCircle,
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
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between force-light">
            {/* Header Gara Tinh Gọn */}
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 sm:px-6 flex items-center justify-between">
                <Link
                    href="/tra-cuu"
                    className="flex items-center shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98]"
                    title="Về trang tra cứu"
                >
                    <Image
                        src="/logo-duy-auto-remove-bg-v1.png"
                        alt={settings.name || "Duy Auto Logo"}
                        width={160}
                        height={70}
                        priority
                        className="h-9 sm:h-11 w-auto object-contain"
                    />
                </Link>

                {/* Hotline Số Điện Thoại */}
                {settings.hotline && (
                    <a
                        href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                        className="touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 shadow-2xs"
                        title="Gọi Hotline Gara"
                    >
                        <Phone className="w-3.5 h-3.5 text-red-500 fill-current shrink-0" />
                        <span>{settings.hotline}</span>
                    </a>
                )}
            </header>

            {/* Khối Trung Tâm: Thẻ Vé Dịch Vụ (Phương Án C) */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full mx-auto my-auto space-y-4">
                <div className="w-full max-w-md">
                    {/* Service Pass Card */}
                    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
                        {/* Dải line màu thương hiệu trên đỉnh thẻ */}
                        <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500" />

                        <div className="p-5 sm:p-7 space-y-5">
                            {/* Header Thẻ */}
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-2xs font-semibold uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Hệ Thống Xác Thực Điện Tử</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                                    Tra Cứu Bảo Hành
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500">
                                    Nhập biển số xe để kiểm tra thời hạn & linh kiện phụ tùng
                                </p>
                            </div>

                            <div className="h-px bg-slate-100" />

                        {/* Form Nhập Biển Số */}
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="plate-input"
                                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                                >
                                    Biển số xe
                                </label>
                                <div className="relative">
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
                                        placeholder="VD: 51K-889.99"
                                        autoCapitalize="characters"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        autoFocus
                                        className="w-full h-12 px-3.5 pr-9 rounded-xl border border-slate-200 bg-slate-50/60 font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-sm transition-all"
                                        style={{
                                            fontFamily:
                                                "var(--font-plate), monospace",
                                        }}
                                    />
                                    {inputPlate && (
                                        <button
                                            type="button"
                                            onClick={() => setInputPlate("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                                            title="Xóa"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Nút Submit Chính */}
                            <button
                                type="submit"
                                className="touch-target w-full h-11 sm:h-12 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-xs shadow-blue-500/20"
                            >
                                <span>Tra Cứu Thông Tin</span>
                                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                            </button>
                        </form>

                        {/* Lịch sử tra cứu gần đây (Recent Searches) */}
                        {recentPlates.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
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
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 font-mono font-medium text-xs border border-slate-200/80 hover:border-blue-200 transition-all active:scale-95 cursor-pointer"
                                        >
                                            <span>
                                                {formatPlateDisplay(plate)}
                                            </span>
                                            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Dòng Hỗ Trợ Bên Dưới Card */}
                    <div className="pt-3 px-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 text-center sm:text-left">
                        {settings.hotline && (
                            <a
                                href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                                className="text-slate-500 hover:text-slate-800 font-medium underline-offset-2 hover:underline transition-colors"
                            >
                                Cần hỗ trợ? Gọi {settings.hotline}
                            </a>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer tối giản */}
            <footer className="p-3 text-center text-xs text-slate-400">
                <span>Hệ thống bảo hành Duy.lamxedao.thuduc</span>
            </footer>
        </div>
    );
}

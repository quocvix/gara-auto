"use client";

import React from "react";
import { PhoneCall } from "lucide-react";

interface GarageSupportActionsProps {
    hotline?: string;
    title?: string;
    variant?: "card" | "inline";
    className?: string;
}

/**
 * Làm sạch chuỗi số điện thoại Việt Nam để dùng cho tel: và Zalo deep link
 */
export function cleanPhoneNumber(phone: string): string {
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("84") && clean.length > 9) {
        clean = "0" + clean.slice(2);
    }
    return clean;
}

/**
 * Icon Zalo chính thức vector sắc nét
 */
export function ZaloIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M16 2.5C8.544 2.5 2.5 8.12 2.5 15.05c0 3.86 1.884 7.31 4.84 9.61L6 29.5l5.525-2.02c1.39.43 2.89.67 4.475.67 7.456 0 13.5-5.62 13.5-12.55S23.456 2.5 16 2.5z"
                fill="currentColor"
            />
            <path d="M11 11.5h9.5l-6.8 8h7.3v2H11l6.8-8H11v-2z" fill="#FFFFFF" />
        </svg>
    );
}

export function GarageSupportActions({
    hotline,
    title = "Cần hỗ trợ?",
    variant = "card",
    className = "",
}: GarageSupportActionsProps) {
    if (!hotline) return null;

    const cleanPhone = cleanPhoneNumber(hotline);
    if (!cleanPhone) return null;

    const buttons = (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
            {/* Nút Gọi trực tiếp qua tel: */}
            <a
                href={`tel:${cleanPhone}`}
                className="touch-target group flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100/80 active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
                title={`Gọi hotline gara: ${hotline}`}
            >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-left min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors truncate">
                        Gọi trực tiếp
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-rose-600/90 truncate">{hotline}</div>
                </div>
            </a>

            {/* Nút Nhắn tin qua Zalo Universal Link: Mở app Zalo nếu có trên máy */}
            <a
                href={`https://zalo.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target group flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border border-blue-200/90 bg-blue-50/70 hover:bg-blue-100/80 active:scale-[0.98] transition-all shadow-2xs cursor-pointer text-[#0068FF]"
                title={`Nhắn tin qua Zalo tới: ${hotline}`}
            >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0068FF] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <ZaloIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0068FF] transition-colors truncate">
                        Nhắn Zalo
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#0068FF]/90 truncate">Mở app Zalo</div>
                </div>
            </a>
        </div>
    );

    if (variant === "inline") {
        return <div className={`w-full ${className}`}>{buttons}</div>;
    }

    return (
        <section aria-label="Liên hệ hỗ trợ gara" className={`w-full ${className}`}>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2 px-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-slate-700 truncate">{title}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 tracking-tight shrink-0">{hotline}</span>
                </div>
                {buttons}
            </div>
        </section>
    );
}

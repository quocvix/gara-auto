"use client";

import React from "react";
import type { WarrantyStatus } from "@/types/garage";
import { ShieldCheck, Clock, ShieldAlert } from "lucide-react";

interface StatusBadgeProps {
    status: WarrantyStatus;
    days?: number;
    showDays?: boolean;
    expiresOn?: string;
    className?: string;
}

export function StatusBadge({
    status,
    days,
    showDays = false,
    expiresOn,
    className = "",
}: StatusBadgeProps) {
    const tooltip = expiresOn ? `Hết hạn trước ngày: ${expiresOn}` : undefined;

    if (status === "active") {
        return (
            <span
                title={tooltip}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs shadow-emerald-600/25 border border-emerald-500 whitespace-nowrap transition-all ${className}`}
            >
                <ShieldCheck className="w-4 h-4 stroke-[2.5] text-white shrink-0" />
                <span>Còn hạn</span>
                {showDays && days !== undefined && (
                    <span className="font-mono text-[11px] text-emerald-100 font-semibold">
                        ({days} ngày)
                    </span>
                )}
            </span>
        );
    }

    if (status === "expiring") {
        return (
            <span
                title={tooltip}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs shadow-amber-500/25 border border-amber-400 whitespace-nowrap transition-all ${className}`}
            >
                <Clock className="w-4 h-4 stroke-[2.5] text-white shrink-0" />
                <span>Sắp hết hạn</span>
                {days !== undefined && (
                    <span className="font-mono text-[11px] text-amber-100 font-semibold">
                        ({days} ngày)
                    </span>
                )}
            </span>
        );
    }

    return (
        <span
            title={tooltip}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs shadow-rose-600/25 border border-rose-500 whitespace-nowrap transition-all ${className}`}
        >
            <ShieldAlert className="w-4 h-4 stroke-[2.5] text-white shrink-0" />
            <span>Hết hạn</span>
        </span>
    );
}


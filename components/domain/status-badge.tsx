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
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-100 bg-emerald-50/75 text-emerald-700 whitespace-nowrap transition-colors ${className}`}
            >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Còn hạn</span>
                {showDays && days !== undefined && (
                    <span className="font-mono text-[11px] text-emerald-600/80 font-normal">
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-amber-200/80 bg-amber-50/75 text-amber-800 whitespace-nowrap transition-colors ${className}`}
            >
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Sắp hết hạn</span>
                {days !== undefined && (
                    <span className="font-mono text-[11px] text-amber-700 font-normal">
                        ({days} ngày)
                    </span>
                )}
            </span>
        );
    }

    return (
        <span
            title={tooltip}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-rose-100 bg-rose-50/75 text-rose-700 whitespace-nowrap transition-colors ${className}`}
        >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Hết hạn</span>
        </span>
    );
}

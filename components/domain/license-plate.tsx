"use client";

import React from "react";
import { formatPlateDisplay } from "@/lib/plate";
import { cn } from "@/lib/utils";

interface LicensePlateProps {
    plate: string;
    color?: "white" | "yellow";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LicensePlate({ plate, color = "white", size = "md", className = "" }: LicensePlateProps) {
    const display = formatPlateDisplay(plate);

    const sizeClasses = {
        sm: "text-sm px-2.5 py-1 rounded min-w-[100px]",
        md: "text-base sm:text-lg px-3.5 py-1.5 rounded-lg min-w-[140px]",
        lg: "text-2xl sm:text-3xl px-5 py-2.5 rounded-xl min-w-[200px]",
    };

    const screwSize = {
        sm: "w-1 h-1",
        md: "w-1.5 h-1.5",
        lg: "w-2 h-2",
    };

    const isYellow = color === "yellow";

    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center font-bold tracking-wider font-mono select-none shrink-0 whitespace-nowrap plate-embossed transition-transform border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_16px_-3px_rgba(0,0,0,0.4)] rounded-xl",
                isYellow
                    ? "bg-[#FACC15] text-[#0F172A]"
                    : "bg-[#FFFFFF] text-[#0F172A]",
                sizeClasses[size],
                className
            )}
            style={{ fontFamily: "var(--font-plate), monospace" }}
        >
            {/* 4 Ốc vít ở 4 góc */}
            <span
                className={`absolute top-1 left-1.5 rounded-full bg-[#64748B]/50 ${screwSize[size]}`}
            />
            <span
                className={`absolute top-1 right-1.5 rounded-full bg-[#64748B]/50 ${screwSize[size]}`}
            />
            <span
                className={`absolute bottom-1 left-1.5 rounded-full bg-[#64748B]/50 ${screwSize[size]}`}
            />
            <span
                className={`absolute bottom-1 right-1.5 rounded-full bg-[#64748B]/50 ${screwSize[size]}`}
            />

            {/* Chữ biển số */}
            <span className="uppercase whitespace-nowrap">{display}</span>
        </div>
    );
}

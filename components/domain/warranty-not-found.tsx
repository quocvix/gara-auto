"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, SearchX } from "lucide-react";
import { LicensePlate } from "@/components/domain/license-plate";
import { GarageSupportActions } from "@/components/domain/garage-support-actions";
import type { GarageSettings } from "@/types/garage";

interface WarrantyNotFoundProps {
    plate: string;
    settings?: Partial<GarageSettings>;
}

export function WarrantyNotFound({
    plate,
    settings = {},
}: WarrantyNotFoundProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between relative force-light selection:bg-blue-600/10 selection:text-blue-600">
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

            {/* Header: Quay lại bên trái, Logo Duy Auto bên phải */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
                <button
                    type="button"
                    onClick={() => router.push("/tra-cuu")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Quay lại</span>
                </button>

                <Link
                    href="/tra-cuu"
                    className="flex items-center hover:opacity-95 transition-opacity"
                >
                    <Image
                        src="/logo-duy-auto-remove-bg-v1.png"
                        alt={settings.name || "Duy Auto Logo"}
                        width={160}
                        height={65}
                        priority
                        className="h-8 sm:h-9 w-auto object-contain"
                    />
                </Link>
            </header>

            {/* Main Content Not Found */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-md w-full mx-auto my-auto text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mx-auto shadow-sm shadow-amber-500/10">
                    <SearchX className="w-8 h-8 stroke-[1.8]" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Không Tìm Thấy Dữ Liệu Cho Biển Số Xe
                    </h1>
                    <div className="pt-2 flex justify-center">
                        <LicensePlate plate={plate} size="md" />
                    </div>
                </div>

                <div className="w-full space-y-2.5 pt-1">
                    <GarageSupportActions
                        hotline={settings.hotline}
                        variant="inline"
                    />
                    <button
                        type="button"
                        onClick={() => router.push("/tra-cuu")}
                        className="touch-target w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                        Tra cứu biển số khác
                    </button>
                </div>
            </main>
        </div>
    );
}

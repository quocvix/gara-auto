"use client";

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

export function WarrantyNotFound({ plate, settings = {} }: WarrantyNotFoundProps) {
    const router = useRouter();

    return (
        <div className="force-light min-h-[100svh] sm:min-h-dvh w-full bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600/10 selection:text-blue-600 relative overflow-x-hidden overscroll-y-none">
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
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs pt-[max(0.625rem,env(safe-area-inset-top))]">
                <button
                    type="button"
                    onClick={() => router.push("/tra-cuu")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Tra cứu lại</span>
                </button>

                <Link href="/tra-cuu" className="flex items-center hover:opacity-95 transition-opacity">
                    <Image
                        src="/logo-duy-auto-remove-bg-v1.png"
                        alt={settings.name || "Duy Auto Logo"}
                        width={160}
                        height={65}
                        priority
                        className="h-7 sm:h-8 w-auto object-contain"
                    />
                </Link>
            </header>

            {/* Main Content Not Found (Fit vừa vặn 100svh không bị scroll thừa) */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-3 sm:py-6 max-w-md w-full mx-auto text-center space-y-4 sm:space-y-5">
                {/* Visual Icon Badge với Ambient Aura */}
                <div className="relative flex justify-center items-center">
                    <div
                        className="pointer-events-none absolute w-24 h-24 rounded-full bg-amber-400/20 blur-xl -z-10"
                        aria-hidden="true"
                    />
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-center text-amber-600 shadow-md shadow-amber-500/10">
                        <SearchX className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
                    </div>
                </div>

                {/* Tiêu đề & Biển số xe */}
                <div className="space-y-2.5 w-full">
                    <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                        Chưa Tìm Thấy Hồ Sơ Bảo Hành
                    </h1>

                    <div className="flex justify-center pt-0.5">
                        <LicensePlate plate={plate} size="md" />
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Biển số chưa có dữ liệu trên hệ thống hoặc hồ sơ dịch vụ đang được kỹ thuật viên cập nhật.
                    </p>
                </div>

                {/* Các nút hành động chính */}
                <div className="w-full space-y-2.5 pt-1">
                    <button
                        type="button"
                        onClick={() => router.push("/tra-cuu")}
                        className="touch-target w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                    >
                        <span>Nhập Lại Biển Số Khác</span>
                        <ArrowLeft className="w-4 h-4 stroke-[2.2] rotate-180" />
                    </button>

                    <GarageSupportActions hotline={settings.hotline} variant="inline" className="w-full" />
                </div>
            </main>
        </div>
    );
}

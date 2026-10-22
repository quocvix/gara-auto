"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGarageStore } from "@/lib/store/garage-store";
import { useShallow } from "zustand/react/shallow";
import { normalizePlate, sanitizePlateInput } from "@/lib/plate";
import { todayVN } from "@/lib/warranty";
import { LicensePlate } from "@/components/domain/license-plate";
import {
    Car,
    Clock,
    AlertTriangle,
    FileCheck2,
    Phone,
    ArrowRight,
    CheckCircle2,
    Search,
    X,
    ChevronRight,
    Package,
    History,
    ShieldCheck,
    User,
    ExternalLink,
} from "lucide-react";
import { useHaptic } from "@/hooks/use-haptic";

export default function AdminDashboardPage() {
    const router = useRouter();
    const { getVehicleOverviewList, parts, settings, vehicles, tickets } = useGarageStore(
        useShallow((s) => ({
            getVehicleOverviewList: s.getVehicleOverviewList,
            parts: s.parts,
            settings: s.settings,
            vehicles: s.vehicles,
            tickets: s.tickets,
        }))
    );
    const { trigger } = useHaptic();

    const [searchPlate, setSearchPlate] = useState("");

    // Vercel React Best Practices `rerender-memo` & `rerender-derived-state-no-effect`
    const allVehicles = useMemo(() => getVehicleOverviewList(), [getVehicleOverviewList, vehicles, tickets, settings]);
    const expiringVehicles = useMemo(() => allVehicles.filter((v) => v.status === "expiring"), [allVehicles]);
    const lowStockPartsList = useMemo(
        () => parts.filter((p) => p.isActive && p.stock <= settings.lowStockThreshold),
        [parts, settings.lowStockThreshold]
    );

    const kpis = useMemo(() => {
        const currentYearMonth = todayVN().slice(0, 7);
        const ticketsThisMonth = tickets.filter((t) => t.activatedOn.startsWith(currentYearMonth)).length;
        const activeVehicles = allVehicles.filter((v) => v.status === "active" || v.status === "expiring").length;

        return {
            activeVehicles,
            expiringVehicles: expiringVehicles.length,
            lowStockParts: lowStockPartsList.length,
            ticketsThisMonth,
        };
    }, [allVehicles, expiringVehicles.length, lowStockPartsList.length, tickets]);

    const handleQuickSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchPlate.trim();
        if (!q) return;
        trigger("tap");
        const norm = normalizePlate(q);
        const exactMatch = vehicles.find((v) => normalizePlate(v.plate) === norm);
        if (exactMatch) {
            router.push(`/admin/xe/${exactMatch.id}`);
        } else {
            router.push(`/admin/xe?q=${encodeURIComponent(q)}`);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* 1. MOBILE GARA PROFILE & QUICK SEARCH (Hiển thị mượt mà trên mobile khi bỏ fixed header) */}
            <div className="lg:hidden space-y-3">
                {/* Brand Banner */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <img
                            src="/logo-duy-auto-remove-bg-v1.png"
                            alt={settings.name || "Duy Auto"}
                            className="h-8 w-auto object-contain shrink-0 drop-shadow-2xs"
                        />
                        <div className="min-w-0">
                            <h1 className="text-base font-black tracking-tight text-slate-900 uppercase truncate leading-none">
                                {settings.name || "DUY AUTO"}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <span className="text-[11px] text-slate-500 font-medium">Bảng điều khiển quản trị</span>
                            </div>
                        </div>
                    </div>

                    <a
                        href="/tra-cuu"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200/90 bg-white/90 text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-2xs transition-all active:scale-95 shrink-0"
                        title="Mở cổng tra cứu của khách"
                    >
                        <span>Trang khách</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    </a>
                </div>

                {/* Quick Search Plate Form */}
                <form onSubmit={handleQuickSearch} className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchPlate}
                        onChange={(e) => setSearchPlate(e.target.value)}
                        placeholder="Tìm nhanh biển số xe (VD: 51K-123.45)..."
                        className="w-full h-11 pl-10 pr-22 rounded-xl border border-slate-200/90 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-medium uppercase transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!searchPlate.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg bg-blue-600 disabled:opacity-40 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                        Tra cứu
                    </button>
                </form>
            </div>

            {/* 2. BENTO KPI TELEMETRY CARDS (Tương phản cao, đổ bóng có màu, dải phân cấp chiều sâu rõ rệt) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {/* KPI 1: Xe Còn Hạn (Emerald Tone) */}
                <Link
                    href="/admin/xe?status=active"
                    onClick={() => trigger("tap")}
                    className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-white to-emerald-50/40 border border-emerald-300/80 border-t-4 border-t-emerald-500 shadow-md shadow-emerald-900/5 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Xe Còn Hạn</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
                            <Car className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-emerald-700 tracking-tight">
                            {kpis.activeVehicles}
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-1 flex items-center gap-1 font-semibold truncate">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            <span>Đang bảo hành</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
                        </div>
                    </div>
                </Link>

                {/* KPI 2: Sắp Hết Hạn (CARD ƯU TIÊN - Amber Solar Alert) */}
                <Link
                    href="/admin/xe?status=expiring"
                    onClick={() => trigger("tap")}
                    className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white border-2 border-amber-400 border-t-4 border-t-amber-500 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                    {kpis.expiringVehicles > 0 && (
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5" aria-hidden="true">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                        </span>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                            Sắp Hết Hạn
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
                            <Clock className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-amber-700 tracking-tight">
                            {kpis.expiringVehicles}
                        </div>
                        <div className="text-[11px] text-amber-900 mt-1 flex items-center gap-1 font-bold truncate">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                            <span>Cần gọi chăm sóc</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
                        </div>
                    </div>
                </Link>

                {/* KPI 3: Kho Sắp Hết (Rose Alert) */}
                <Link
                    href="/admin/kho?filter=low"
                    onClick={() => trigger("tap")}
                    className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-50/40 to-white border-2 border-rose-300 border-t-4 border-t-rose-500 shadow-md shadow-rose-500/10 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-950 uppercase tracking-wide">Kho Sắp Hết</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
                            <AlertTriangle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-rose-600 tracking-tight">
                            {kpis.lowStockParts}
                        </div>
                        <div className="text-[11px] text-rose-800 mt-1 flex items-center gap-1 font-semibold truncate">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
                            <span>≤ {settings.lowStockThreshold} sản phẩm</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
                        </div>
                    </div>
                </Link>

                {/* KPI 4: Phiếu Tháng Này (Cobalt Blue) */}
                <Link
                    href="/admin/xe"
                    onClick={() => trigger("tap")}
                    className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/40 border border-blue-300/80 border-t-4 border-t-blue-500 shadow-md shadow-blue-900/5 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 truncate">Phiếu Tháng Này</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-2xs">
                            <FileCheck2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-blue-700 tracking-tight">
                            {kpis.ticketsThisMonth}
                        </div>
                        <div className="text-[11px] text-blue-800 mt-1 flex items-center gap-1 font-semibold truncate">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                            <span>Hồ sơ phát hành</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* 3. KHỐI TRỌNG TÂM: XE SẮP HẾT HẠN CẦN CHĂM SÓC KHÁCH HÀNG */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden transition-all">
                {/* Header thanh lịch với tông Slate-Amber tương phản */}
                <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-amber-500/15 via-amber-50/40 to-slate-50 border-b border-amber-200/80 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                            <Clock className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide truncate">
                                    Xe Sắp Hết Hạn
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono font-bold text-2xs shrink-0">
                                    {expiringVehicles.length}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                                Cần gọi nhắc lịch bảo dưỡng định kỳ
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/xe?status=expiring"
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors shrink-0 py-1 px-2.5 rounded-lg hover:bg-blue-50"
                    >
                        <span>Tất cả</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </Link>
                </div>

                {expiringVehicles.length > 0 ? (
                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {expiringVehicles.map((veh) => (
                            <div
                                key={veh.id}
                                className="group p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-amber-50/20 border border-slate-200/90 hover:border-amber-300/90 border-l-4 border-l-amber-500 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-3"
                            >
                                {/* Hàng 1: Biển số xe & Thẻ đếm ngược thời hạn */}
                                <div className="flex items-center justify-between gap-2">
                                    <div
                                        onClick={() => router.push(`/admin/xe/${veh.id}`)}
                                        className="cursor-pointer group-hover:scale-102 transition-transform shrink-0"
                                    >
                                        <LicensePlate plate={veh.plate} color={veh.plateColor} size="sm" />
                                    </div>

                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-300/80 text-amber-900 font-bold text-xs font-mono shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                        <span>Còn {veh.daysLeft} ngày</span>
                                    </div>
                                </div>

                                {/* Hàng 2: Tên dòng xe & Thông tin chủ xe */}
                                <div
                                    onClick={() => router.push(`/admin/xe/${veh.id}`)}
                                    className="cursor-pointer space-y-1"
                                >
                                    <div className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                        {veh.model}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Chủ xe:</span>
                                        <strong className="text-slate-800 font-bold truncate">
                                            {veh.ownerName || "Chưa có tên"}
                                        </strong>
                                    </div>
                                </div>

                                {/* Hàng 3: Các nút hành động thao tác 1 chạm */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                    {veh.ownerPhone ? (
                                        <a
                                            href={`tel:${veh.ownerPhone}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 h-9 sm:h-8.5 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                                            title={`Gọi khách hàng ${veh.ownerName}: ${veh.ownerPhone}`}
                                        >
                                            <Phone className="w-3.5 h-3.5 fill-current" />
                                            <span className="truncate">Gọi ({veh.ownerPhone})</span>
                                        </a>
                                    ) : (
                                        <div className="flex-1 text-xs text-slate-400 italic py-1.5">
                                            Chưa có SĐT
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => router.push(`/admin/xe/${veh.id}`)}
                                        className="h-9 sm:h-8.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                                    >
                                        <span>Hồ sơ</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-xs sm:text-sm text-slate-500 bg-slate-50/40">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        Tất cả phương tiện đều còn hạn bảo hành dài hạn an toàn.
                    </div>
                )}
            </div>

            {/* 4. CẢNH BÁO PHỤ TÙNG SẮP HẾT HÀNG */}
            {lowStockPartsList.length > 0 && (
                <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden transition-all">
                    {/* Header cảnh báo Tồn kho */}
                    <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-rose-500/15 via-rose-50/40 to-slate-50 border-b border-rose-200/80 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
                                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide truncate">
                                        Tồn Kho Thấp
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold text-2xs shrink-0">
                                        {lowStockPartsList.length}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                                    Dưới định mức an toàn, cần nhập thêm
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/admin/kho?filter=low"
                            className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition-colors shrink-0 py-1 px-2.5 rounded-lg hover:bg-rose-50"
                        >
                            <span>Kho hàng</span>
                            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                    </div>

                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {lowStockPartsList.map((p) => {
                            const maxThreshold = Math.max(settings.lowStockThreshold * 2, 10);
                            const percent = Math.min(100, Math.round((p.stock / maxThreshold) * 100));

                            return (
                                <Link
                                    key={p.id}
                                    href="/admin/kho?filter=low"
                                    onClick={() => trigger("tap")}
                                    className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 flex items-center justify-between gap-3 text-xs transition-all cursor-pointer group shadow-2xs focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-slate-900 truncate group-hover:text-rose-700 transition-colors">
                                            {p.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                                            {p.category}
                                        </div>
                                        {/* Thanh tiến độ tồn kho trực quan */}
                                        <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-rose-500 h-1.5 rounded-full transition-all"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono font-black text-xs shrink-0 shadow-xs tabular-nums">
                                        Còn {p.stock}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 5. PHÍM TẮT TRUY CẬP NHANH (Bảng điều hướng bổ trợ cho Admin) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <Link
                    href="/admin/xe"
                    className="p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group shadow-2xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Car className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                Quản Lý Hồ Sơ Xe
                            </div>
                            <div className="text-[11px] text-slate-500">Tra cứu & lịch sử bảo hành</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                    href="/admin/kho"
                    className="p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between group shadow-2xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Package className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                                Quản Lý Kho Hàng
                            </div>
                            <div className="text-[11px] text-slate-500">Danh mục & tồn kho phụ tùng</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                    href="/admin/kho/lich-su"
                    className="p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 hover:border-purple-400 hover:shadow-md transition-all flex items-center justify-between group shadow-2xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <History className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                                Lịch Sử Xuất Nhập
                            </div>
                            <div className="text-[11px] text-slate-500">Nhật ký biến động kho</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

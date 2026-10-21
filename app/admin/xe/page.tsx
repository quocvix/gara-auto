"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGarageStore } from "@/lib/store/garage-store";
import { useUIStore } from "@/lib/store/ui-store";
import { normalizePlate } from "@/lib/plate";
import { formatDateVN } from "@/lib/format";
import { LicensePlate } from "@/components/domain/license-plate";
import { CarColorPicker } from "@/components/domain/car-color-picker";
import { StatusBadge } from "@/components/domain/status-badge";
import { useTicketModal } from "@/components/domain/ticket-modal";
import { VehicleOverview } from "@/types/garage";
import {
    Search,
    Plus,
    MoreVertical,
    Eye,
    Trash2,
    Edit,
    ExternalLink,
    Car,
    Phone,
    X,
    Calendar,
    FileText,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";
import { useAlertDialog } from "@/components/ui/alert-dialog";

type FilterStatus = "all" | "active" | "expiring" | "expired";

function VehiclesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getVehicleOverviewList, deleteVehicle, tickets, vehicles: rawVehicles, settings } = useGarageStore();
    const { openTicketModal } = useTicketModal();
    const { trigger } = useHaptic();
    const { confirm } = useAlertDialog();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>(
        (searchParams.get("status") as FilterStatus) || "all",
    );
    const [selectedVehicleForSheet, setSelectedVehicleForSheet] = useState<VehicleOverview | null>(null);
    const hideBottomNav = useUIStore((state) => state.hideBottomNav);
    const showBottomNav = useUIStore((state) => state.showBottomNav);

    // Khi hiện Bottom Sheet: Ẩn Floating Tab Bar và khóa cuộn nền (body scroll lock) chuẩn UX mobile
    useEffect(() => {
        if (!selectedVehicleForSheet) return;

        hideBottomNav();
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            showBottomNav();
            document.body.style.overflow = originalOverflow;
        };
    }, [selectedVehicleForSheet, hideBottomNav, showBottomNav]);

    // Vercel React Best Practices `rerender-memo` & `rerender-derived-state-no-effect`
    const vehicles = useMemo(() => getVehicleOverviewList(), [getVehicleOverviewList, rawVehicles, tickets, settings]);

    // Thống kê số lượng theo từng trạng thái
    const statusCounts = useMemo(() => {
        let active = 0;
        let expiring = 0;
        let expired = 0;
        vehicles.forEach((v) => {
            if (v.status === "active") active++;
            else if (v.status === "expiring") expiring++;
            else if (v.status === "expired") expired++;
        });
        return {
            all: vehicles.length,
            active,
            expiring,
            expired,
        };
    }, [vehicles]);

    // Lọc theo tìm kiếm và trạng thái
    const filteredVehicles = useMemo(() => {
        return vehicles.filter((v) => {
            // Lọc trạng thái
            if (statusFilter !== "all" && v.status !== statusFilter) {
                return false;
            }

            // Lọc tìm kiếm
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchPlate = v.plate.toLowerCase().includes(q) || v.plateNormalized.includes(normalizePlate(q));
                const matchModel = v.model.toLowerCase().includes(q);
                const matchOwner = (v.ownerName || "").toLowerCase().includes(q);
                const matchPhone = (v.ownerPhone || "").includes(q);
                return matchPlate || matchModel || matchOwner || matchPhone;
            }

            return true;
        });
    }, [vehicles, statusFilter, searchQuery]);

    const handleDelete = async (v: VehicleOverview) => {
        setSelectedVehicleForSheet(null);
        const ok = await confirm({
            title: `Xác nhận xóa xe [${v.plate}]?`,
            description: (
                <div className="space-y-2">
                    <p>
                        Xe <strong>{v.plate}</strong> ({v.model}) cùng các phiếu bảo hành liên quan sẽ bị xóa khỏi danh
                        sách quản lý.
                    </p>
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 text-amber-800 dark:text-amber-300 text-xs font-medium">
                        Hệ thống sẽ tự động <strong>hoàn lại tồn kho</strong> cho các linh kiện, phụ tùng đã lắp đặt
                        trước đó.
                    </div>
                </div>
            ),
            variant: "danger",
            confirmText: "Xóa & hoàn tồn kho",
            cancelText: "Hủy bỏ",
        });
        if (ok) {
            await deleteVehicle(v.id, true);
            toast.success(`Đã xóa xe [${v.plate}] và hoàn lại tồn kho!`);
        }
    };

    const handleEditLatestTicket = (v: VehicleOverview) => {
        setSelectedVehicleForSheet(null);
        trigger("tap");
        const vTickets = tickets
            .filter((t) => t.vehicleId === v.id)
            .sort((a, b) => b.activatedOn.localeCompare(a.activatedOn));
        const latest = vTickets[0];

        openTicketModal({
            ticketId: latest?.id,
            vehicle: v,
            note: latest?.note,
            activatedOn: latest?.activatedOn,
            items: latest?.items.map((it) => ({
                partId: it.partId || "",
                quantity: it.quantity,
                warrantyMonths: it.warrantyMonths,
                activatedOn: it.activatedOn || latest?.activatedOn,
            })),
        });
    };

    const handleOpenSheet = (e: React.MouseEvent, v: VehicleOverview) => {
        e.stopPropagation();
        trigger("tap");
        setSelectedVehicleForSheet(v);
    };

    const handleCardClick = (v: VehicleOverview) => {
        trigger("tap");
        router.push(`/admin/xe/${v.id}`);
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* Top Header */}
            <div className="flex flex-row items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Quản Lý Hồ Sơ Xe</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            openTicketModal();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Tạo Phiếu</span>
                    </button>
                </div>
            </div>

            {/* Sticky Search & Filter Header trên Mobile */}
            <div className="sticky top-0 z-20 -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 py-2.5 bg-[#E1E7EF]/90 backdrop-blur-md space-y-2.5 transition-all">
                {/* Search Bar - Chống lóa mắt, bo góc mềm mại */}
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm biển số, dòng xe, chủ xe, SĐT..."
                        className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200/80 bg-white/95 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none shadow-[0_2px_8px_rgba(15,23,42,0.04)] placeholder:text-slate-400 transition-all"
                    />
                    {searchQuery.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                trigger("tap");
                                setSearchQuery("");
                            }}
                            className="w-8 h-8 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                            aria-label="Xóa tìm kiếm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Chips cuộn ngang với badge đếm số lượng - Nền dịu mắt chống chói lóa */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:-mx-6 sm:px-6">
                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            setStatusFilter("all");
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                            statusFilter === "all"
                                ? "bg-blue-600 text-white shadow-xs shadow-blue-600/30 font-bold"
                                : "bg-white/80 border border-slate-200/70 text-slate-700 hover:bg-white shadow-2xs"
                        }`}
                    >
                        <span>Tất cả</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                statusFilter === "all" ? "bg-blue-700 text-white" : "bg-slate-150 text-slate-600"
                            }`}
                        >
                            {statusCounts.all}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            setStatusFilter("active");
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                            statusFilter === "active"
                                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 font-bold"
                                : "bg-white/80 border border-slate-200/70 text-slate-700 hover:bg-white shadow-2xs"
                        }`}
                    >
                        <span>Còn hạn</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                statusFilter === "active"
                                    ? "bg-emerald-700 text-white"
                                    : "bg-emerald-100 text-emerald-800"
                            }`}
                        >
                            {statusCounts.active}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            setStatusFilter("expiring");
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                            statusFilter === "expiring"
                                ? "bg-amber-500 text-white shadow-xs shadow-amber-500/30 font-bold"
                                : "bg-white/80 border border-slate-200/70 text-slate-700 hover:bg-white shadow-2xs"
                        }`}
                    >
                        <span>Sắp hết hạn</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                statusFilter === "expiring" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-900"
                            }`}
                        >
                            {statusCounts.expiring}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            setStatusFilter("expired");
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                            statusFilter === "expired"
                                ? "bg-rose-600 text-white shadow-xs shadow-rose-600/30 font-bold"
                                : "bg-white/80 border border-slate-200/70 text-slate-700 hover:bg-white shadow-2xs"
                        }`}
                    >
                        <span>Hết hạn</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                statusFilter === "expired" ? "bg-rose-700 text-white" : "bg-rose-100 text-rose-800"
                            }`}
                        >
                            {statusCounts.expired}
                        </span>
                    </button>
                </div>
            </div>

            {/* DANH SÁCH XE: APP-LIKE CARDS TRÊN MOBILE, BẢNG TRÊN DESKTOP */}
            {filteredVehicles.length > 0 ? (
                <>
                    {/* 1. Mobile Cards View (< 1024px) - Bật nổi khối trên nền Slate Muted (Pop Effect) */}
                    <div className="lg:hidden space-y-4">
                        {filteredVehicles.map((v) => (
                            <div
                                key={v.id}
                                onClick={() => handleCardClick(v)}
                                className="group relative p-4.5 rounded-2xl border border-slate-300/50 bg-white shadow-[0_4px_16px_-3px_rgba(15,23,42,0.08),0_1px_4px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.12),0_4px_10px_-2px_rgba(15,23,42,0.05)] active:scale-[0.99] transition-all cursor-pointer space-y-3.5 overflow-hidden"
                            >
                                {/* Hàng 1: Biển số + Màu sơn xe (chữ nhật) + Status Badge + Nút Options */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <LicensePlate plate={v.plate} color={v.plateColor} size="sm" />
                                        <CarColorPicker vehicleId={v.id} currentColor={v.color} size="sm" />
                                        <StatusBadge status={v.status} />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => handleOpenSheet(e, v)}
                                        className="w-9 h-9 -mr-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90"
                                        aria-label="Tùy chọn thao tác"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Hàng 2: Tên dòng xe to bản, phân cấp trực quan rõ ràng */}
                                <div className="min-w-0">
                                    <h3 className="font-black text-slate-900 text-base leading-snug tracking-tight truncate">
                                        {v.model}
                                    </h3>
                                </div>

                                {/* Hàng 3: Khối thông tin Chủ xe & SĐT dạng Tonal Surface Pill nhẹ nhàng + Nút Gọi trực tiếp 1-chạm */}
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2.5">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-slate-800 text-xs leading-tight truncate">
                                            {v.ownerName || "Chưa có tên chủ xe"}
                                        </div>
                                        <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                                            {v.ownerPhone || "Chưa cập nhật SĐT"}
                                        </div>
                                    </div>

                                    {/* Nút gọi nhanh trực tiếp nếu có SĐT - Touch target >= 40px */}
                                    {v.ownerPhone && (
                                        <a
                                            href={`tel:${v.ownerPhone}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                trigger("tap");
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs shadow-emerald-600/25 shrink-0 active:scale-95 transition-all"
                                            title={`Gọi ${v.ownerPhone}`}
                                        >
                                            <Phone className="w-3.5 h-3.5 fill-current" />
                                            <span>Gọi</span>
                                        </a>
                                    )}
                                </div>

                                {/* Hàng 4: Chân Card: Số phiếu bảo hành dạng Tonal strip (gọn gàng, sạch sẽ) */}
                                <div className="bg-slate-100/70 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                                    <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold text-xs">
                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Lịch sử bảo hành</span>
                                    </span>

                                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white text-slate-800 font-mono text-[11px] font-bold shadow-2xs border border-slate-200/50">
                                            {v.ticketCount} phiếu
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Desktop DataTable View (>= 1024px) - Tông dịu mắt đồng bộ */}
                    <div className="hidden lg:block rounded-2xl border border-slate-300/60 bg-white shadow-xs overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100/80 border-b border-slate-200/80 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                                <tr>
                                    <th className="py-3.5 px-4">Biển Số Xe</th>
                                    <th className="py-3.5 px-4">Dòng Xe</th>
                                    <th className="py-3.5 px-4">Chủ Xe & SĐT</th>
                                    <th className="py-3.5 px-4">Trạng Thái</th>
                                    <th className="py-3.5 px-4 text-center">Số Phiếu</th>
                                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/90 bg-white">
                                {filteredVehicles.map((v) => (
                                    <tr
                                        key={v.id}
                                        onClick={() => handleCardClick(v)}
                                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <LicensePlate plate={v.plate} color={v.plateColor} size="sm" />
                                                <CarColorPicker vehicleId={v.id} currentColor={v.color} size="sm" />
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-black text-slate-900">{v.model}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900">{v.ownerName || "—"}</div>
                                            {v.ownerPhone ? (
                                                <a
                                                    href={`tel:${v.ownerPhone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-mono text-[11px] mt-0.5 group-hover:underline font-semibold"
                                                >
                                                    <Phone className="w-3 h-3 text-emerald-600 fill-current" />
                                                    <span>{v.ownerPhone}</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 font-mono text-2xs">—</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <StatusBadge status={v.status} />
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="inline-flex items-center justify-center min-w-7 h-6 px-1.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                                                {v.ticketCount}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        trigger("tap");
                                                        router.push(`/admin/xe/${v.id}`);
                                                    }}
                                                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditLatestTicket(v)}
                                                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
                                                    title="Sửa phiếu gần nhất"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <a
                                                    href={`/tra-cuu/${v.plateNormalized}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                                                    title="Xem như khách"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(v)}
                                                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                    title="Xóa hồ sơ"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                /* Empty State */
                <div className="p-10 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Car className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-sm text-slate-800">Không tìm thấy xe phù hợp</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.
                    </p>
                    {(searchQuery || statusFilter !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                trigger("tap");
                                setSearchQuery("");
                                setStatusFilter("all");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Xóa bộ lọc</span>
                        </button>
                    )}
                </div>
            )}

            {/* MOBILE BOTTOM SHEET (ACTION DRAWER) - Nền trắng sạch sẽ, bề mặt phân tầng tối giản */}
            {selectedVehicleForSheet && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setSelectedVehicleForSheet(null)}
                >
                    <div
                        className="w-full max-w-lg bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-250 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag Handle Indicator */}
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />

                        {/* Sheet Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <LicensePlate
                                    plate={selectedVehicleForSheet.plate}
                                    color={selectedVehicleForSheet.plateColor}
                                    size="sm"
                                />
                                <div>
                                    <div className="font-black text-slate-900 text-sm leading-tight">
                                        {selectedVehicleForSheet.model}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        {selectedVehicleForSheet.ownerName || "Chưa có tên chủ xe"}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedVehicleForSheet(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Actions List - Nền surface thẻ mềm mại */}
                        <div className="space-y-2 text-sm font-semibold">
                            <button
                                type="button"
                                onClick={() => {
                                    const v = selectedVehicleForSheet;
                                    setSelectedVehicleForSheet(null);
                                    trigger("tap");
                                    router.push(`/admin/xe/${v.id}`);
                                }}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60 text-slate-800 transition-all text-left active:scale-[0.99]"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                    <Eye className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-slate-900 font-bold">Xem chi tiết & lịch sử</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleEditLatestTicket(selectedVehicleForSheet)}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60 text-slate-800 transition-all text-left active:scale-[0.99]"
                            >
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                    <Edit className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-slate-900 font-bold">Sửa phiếu gần nhất</div>
                                </div>
                            </button>

                            <a
                                href={`/tra-cuu/${selectedVehicleForSheet.plateNormalized}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setSelectedVehicleForSheet(null)}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60 text-slate-800 transition-all text-left active:scale-[0.99]"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-slate-900 font-bold">Xem cổng tra cứu khách hàng</div>
                                </div>
                            </a>

                            {selectedVehicleForSheet.ownerPhone && (
                                <a
                                    href={`tel:${selectedVehicleForSheet.ownerPhone}`}
                                    onClick={() => setSelectedVehicleForSheet(null)}
                                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/70 text-slate-800 transition-all text-left active:scale-[0.99]"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                                        <Phone className="w-4 h-4 fill-current" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-emerald-800 font-bold">
                                            Gọi chủ xe ({selectedVehicleForSheet.ownerPhone})
                                        </div>
                                    </div>
                                </a>
                            )}

                            <div className="pt-1" />

                            <button
                                type="button"
                                onClick={() => handleDelete(selectedVehicleForSheet)}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-rose-50/70 hover:bg-rose-50 border border-rose-200/70 text-rose-700 transition-all text-left active:scale-[0.99]"
                            >
                                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                                    <Trash2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-rose-700 font-bold">Xóa hồ sơ xe</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VehiclesPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                    Đang tải dữ liệu hồ sơ xe...
                </div>
            }
        >
            <VehiclesContent />
        </Suspense>
    );
}

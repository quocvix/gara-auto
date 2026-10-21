"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGarageStore } from "@/lib/store/garage-store";
import { formatDateVN } from "@/lib/format";
import { LicensePlate } from "@/components/domain/license-plate";
import { CarColorPicker } from "@/components/domain/car-color-picker";
import { StatusBadge } from "@/components/domain/status-badge";
import { useTicketModal } from "@/components/domain/ticket-modal";
import { daysLeft, getStatus, progressPercent } from "@/lib/warranty";
import { getWarrantyStatusConfig } from "@/lib/warranty-status";
import {
    ArrowLeft,
    Plus,
    ExternalLink,
    User,
    Phone,
    Calendar,
    FileText,
    Edit,
    Trash2,
    Wrench,
    Clock,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";
import { useAlertDialog } from "@/components/ui/alert-dialog";

export default function VehicleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = (params?.id as string) || "";

    const { getVehicleOverviewById, tickets, deleteTicket, settings } = useGarageStore();
    const { openTicketModal } = useTicketModal();
    const { trigger } = useHaptic();
    const { confirm } = useAlertDialog();

    const vehicle = getVehicleOverviewById(id);

    if (!vehicle) {
        return (
            <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white max-w-lg mx-auto space-y-4 my-8 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Không tìm thấy hồ sơ xe này</h3>
                <p className="text-xs text-slate-500">Hồ sơ có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
                <button
                    type="button"
                    onClick={() => {
                        trigger("tap");
                        router.push("/admin/xe");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại danh sách xe</span>
                </button>
            </div>
        );
    }

    // Vercel React Best Practices `rerender-memo`
    const vTickets = useMemo(() => {
        return tickets
            .filter((t) => t.vehicleId === vehicle.id)
            .sort((a, b) => b.activatedOn.localeCompare(a.activatedOn));
    }, [tickets, vehicle.id]);

    const handleCreateNewTicketForThisVehicle = () => {
        trigger("tap");
        openTicketModal({
            vehicle: {
                plate: vehicle.plate,
                plateColor: vehicle.plateColor,
                model: vehicle.model,
                color: vehicle.color,
                ownerName: vehicle.ownerName,
                ownerPhone: vehicle.ownerPhone,
            },
        });
    };

    const handleDeleteTicket = async (ticketId: string) => {
        const ok = await confirm({
            title: "Xóa phiếu bảo hành?",
            description: (
                <div className="space-y-2">
                    <p>Bạn có chắc chắn muốn xóa phiếu bảo hành này khỏi hệ thống không?</p>
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 text-amber-800 dark:text-amber-300 text-xs font-medium">
                        Số lượng các linh kiện, phụ tùng đã trừ trong phiếu này sẽ được{" "}
                        <strong>hoàn lại vào kho hàng</strong>.
                    </div>
                </div>
            ),
            variant: "danger",
            confirmText: "Xóa & hoàn phụ tùng",
            cancelText: "Hủy bỏ",
        });
        if (ok) {
            await deleteTicket(ticketId, true);
            toast.success("Đã xóa phiếu bảo hành và hoàn lại tồn kho!");
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
            {/* Top Navigation Bar: Nút quay lại & Tiêu đề */}
            <div className="flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => {
                        trigger("tap");
                        router.push("/admin/xe");
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white/90 hover:bg-white text-slate-700 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Danh sách xe</span>
                </button>

                <a
                    href={`/tra-cuu/${vehicle.plateNormalized}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200/80 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold active:scale-95 transition-all shadow-2xs"
                    title="Mở cổng tra cứu công khai như khách xem"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cổng tra cứu khách</span>
                    <span className="sm:hidden">Tra cứu</span>
                </a>
            </div>

            {/* THẺ TỔNG QUAN PHƯƠNG TIỆN (HERO CARD - TÔNG SLATE ĐẬM SANG TRỌNG, TƯƠNG PHẢN CAO VỚI LIST PHIẾU TRẮNG) */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_8px_30px_-6px_rgba(15,23,42,0.25)] relative overflow-hidden space-y-4 text-white">
                {/* Ambient Aura Glow trang trí nhẹ góc thẻ */}
                <div
                    className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl"
                    aria-hidden="true"
                />

                {/* Header Card */}
                <div className="relative z-10 space-y-2.5">
                    {/* HÀNG 1: Biển số xe, Thẻ màu sơn chữ nhật & Trạng thái bảo hành nằm cùng 1 hàng */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <LicensePlate plate={vehicle.plate} color={vehicle.plateColor} size="md" />
                        <CarColorPicker vehicleId={vehicle.id} currentColor={vehicle.color} size="md" shape="rect" />
                        <StatusBadge status={vehicle.status} />
                    </div>

                    {/* HÀNG 2: Tên xe nằm riêng 1 mình 1 hàng, to bản và nổi bật trên nền tối */}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                            {vehicle.model}
                        </h1>
                    </div>
                </div>

                {/* Khối Chủ xe & Số điện thoại: Dạng thẻ Surface Tonal tối mờ cao cấp */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                    {/* Cột 1: Chủ xe */}
                    <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 shadow-2xs">
                            <User className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Chủ xe
                            </span>
                            <span className="font-black text-white text-base sm:text-lg leading-tight truncate block mt-0.5">
                                {vehicle.ownerName || "Chưa có tên chủ xe"}
                            </span>
                        </div>
                    </div>

                    {/* Cột 2: Số điện thoại + Nút gọi 1-chạm */}
                    <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 shadow-2xs">
                                <Phone className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Số điện thoại
                                </span>
                                <span className="font-mono font-black text-white text-base sm:text-lg tracking-wider leading-tight truncate block mt-0.5">
                                    {vehicle.ownerPhone || "—"}
                                </span>
                            </div>
                        </div>

                        {vehicle.ownerPhone && (
                            <a
                                href={`tel:${vehicle.ownerPhone}`}
                                onClick={() => trigger("tap")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-all shadow-xs shadow-emerald-500/25 active:scale-95"
                                title={`Gọi ${vehicle.ownerPhone}`}
                            >
                                <Phone className="w-3.5 h-3.5 fill-current" />
                                <span>Gọi</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Action Button: Tạo Phiếu Mới Cho Xe Này */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleCreateNewTicketForThisVehicle}
                        className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Tạo Phiếu Bảo Hành Cho Xe Này</span>
                    </button>
                </div>
            </div>

            {/* LỊCH SỬ CÁC PHIẾU BẢO HÀNH (TIMELINE CARDS)*/}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Lịch Sử ({vTickets.length} lần)
                    </h2>
                </div>

                {vTickets.length > 0 ? (
                    <div className="space-y-5">
                        {vTickets.map((t, idx) => (
                            <div key={t.id} className="relative group">
                                {/* Ticket Card - Nền trắng sạch sẽ, nổi khối trên nền Slate Muted */}
                                <div className="p-4 sm:p-5 rounded-2xl border border-slate-300/50 bg-white shadow-[0_3px_12px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition-all space-y-3.5">
                                    {/* Header phiếu: Đợt X, Ngày kích hoạt, Hạn BH & Nút hành động */}
                                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap uppercase">
                                                <span className="font-black text-sm text-slate-900">
                                                    Lần {vTickets.length - idx}
                                                </span>
                                                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 font-mono font-bold shadow-2xs">
                                                    {formatDateVN(t.activatedOn)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action buttons: Sửa & Xóa phiếu */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    trigger("tap");
                                                    openTicketModal({
                                                        ticketId: t.id,
                                                        vehicle,
                                                        note: t.note,
                                                        activatedOn: t.activatedOn,
                                                        items: t.items.map((it) => ({
                                                            partId: it.partId || "",
                                                            quantity: it.quantity,
                                                            warrantyMonths: it.warrantyMonths,
                                                            activatedOn: it.activatedOn || t.activatedOn,
                                                        })),
                                                    });
                                                }}
                                                className="h-8.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Sửa</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTicket(t.id)}
                                                className="w-8.5 h-8.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center shadow-2xs transition-all cursor-pointer active:scale-95"
                                                title="Xóa phiếu"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Danh sách phụ tùng trong phiếu */}
                                    <div className="space-y-2.5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {t.items.map((item, iIdx) => {
                                                const itemActivatedOn = item.activatedOn || t.activatedOn;
                                                const isUnlimited = !item.expiresOn || item.warrantyMonths === 0;
                                                const itemDaysLeft = isUnlimited ? null : daysLeft(item.expiresOn);
                                                const itemStatus = isUnlimited
                                                    ? "unlimited"
                                                    : getStatus(itemDaysLeft!, settings?.expiringThresholdDays ?? 30);
                                                const percent = isUnlimited
                                                    ? 100
                                                    : progressPercent(itemActivatedOn, item.expiresOn);
                                                const statusConfig = getWarrantyStatusConfig(itemStatus, itemDaysLeft);

                                                return (
                                                    <div
                                                        key={item.id || iIdx}
                                                        className={`rounded-xl border border-slate-200/70 border-l-4 ${statusConfig.accentBorder} bg-slate-50/70 hover:bg-slate-50 p-3 sm:p-3.5 space-y-2.5 shadow-2xs transition-all`}
                                                    >
                                                        {/* 1. Tên linh kiện & số lượng */}
                                                        <div className="flex items-center justify-between gap-2.5 min-w-0">
                                                            <h4
                                                                className="font-black text-slate-900 text-xs sm:text-sm leading-snug truncate min-w-0 flex-1"
                                                                title={item.partName}
                                                            >
                                                                {item.partName}
                                                            </h4>
                                                            {item.quantity >= 1 && (
                                                                <span className="text-3xs font-extrabold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60 tracking-wider shrink-0 font-mono">
                                                                    x{item.quantity}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* 2. Thời hạn & Badge đếm ngày */}
                                                        <div className="space-y-1.5 pt-0.5">
                                                            <div className="flex items-center justify-between gap-1.5 text-xs">
                                                                <span className="flex items-center gap-1 font-semibold text-slate-600 text-2xs">
                                                                    <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                                                                    <span>Thời hạn</span>
                                                                    {item.warrantyMonths > 0 ? (
                                                                        <span className="text-3xs font-extrabold uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200/60 tracking-wider font-mono">
                                                                            BH {item.warrantyMonths}T
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-3xs font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200/60 tracking-wider">
                                                                            Bảo dưỡng
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span
                                                                    className={`px-2 py-0.5 rounded-full font-mono font-bold text-3xs shadow-2xs shrink-0 ${statusConfig.badgeBg}`}
                                                                >
                                                                    {isUnlimited
                                                                        ? "Không giới hạn"
                                                                        : typeof itemDaysLeft === "number"
                                                                          ? itemDaysLeft > 0
                                                                              ? `Còn ${itemDaysLeft} ngày`
                                                                              : "Đã hết hạn"
                                                                          : statusConfig.badgeText}
                                                                </span>
                                                            </div>

                                                            {/* Thanh tiến trình thời gian - Ray màu xám đậm hơn để không bị chìm */}
                                                            <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${statusConfig.barGradient}`}
                                                                    style={{
                                                                        width: `${
                                                                            itemStatus === "expired" ? 0 : percent
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>

                                                            {/* Dòng ngày tháng chi tiết */}
                                                            <div className="flex items-center justify-between text-3xs text-slate-400">
                                                                <span>
                                                                    Kích hoạt:{" "}
                                                                    <strong className="text-slate-600 font-bold font-mono">
                                                                        {formatDateVN(itemActivatedOn)}
                                                                    </strong>
                                                                </span>
                                                                <span>
                                                                    {isUnlimited ? (
                                                                        <strong className="text-indigo-600 font-semibold">
                                                                            Không cố định hạn
                                                                        </strong>
                                                                    ) : (
                                                                        <>
                                                                            Hết hạn:{" "}
                                                                            <strong className="text-slate-700 font-bold font-mono">
                                                                                {formatDateVN(item.expiresOn)}
                                                                            </strong>
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Ghi chú đợt nếu có */}
                                    {t.note && (
                                        <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                                            <span className="font-bold text-slate-800">Ghi chú:</span> {t.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 sm:p-10 text-center border border-dashed border-slate-200 rounded-2xl bg-white space-y-2.5 shadow-xs">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-sm text-slate-800">Xe này chưa có phiếu bảo hành nào</div>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Bấm nút &quot;Tạo Phiếu Bảo Hành Cho Xe Này&quot; ở trên để lập đợt bảo dưỡng đầu tiên.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useGarageStore } from "@/lib/store/garage-store";
import { formatDateVN } from "@/lib/format";
import { LicensePlate } from "@/components/domain/license-plate";
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

    const vTickets = tickets
        .filter((t) => t.vehicleId === vehicle.id)
        .sort((a, b) => b.activatedOn.localeCompare(a.activatedOn));

    const handleCreateNewTicketForThisVehicle = () => {
        trigger("tap");
        openTicketModal({
            vehicle: {
                plate: vehicle.plate,
                plateColor: vehicle.plateColor,
                model: vehicle.model,
                ownerName: vehicle.ownerName,
                ownerPhone: vehicle.ownerPhone,
                odo: vehicle.odo,
            },
            odo: vehicle.odo,
        });
    };

    const handleDeleteTicket = async (ticketId: string) => {
        const ok = await confirm({
            title: "Xóa phiếu bảo hành?",
            description: (
                <div className="space-y-2">
                    <p>Bạn có chắc chắn muốn xóa phiếu bảo hành này khỏi hệ thống không?</p>
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 text-amber-800 dark:text-amber-300 text-xs font-medium">
                        Số lượng các linh kiện, phụ tùng đã trừ trong phiếu này sẽ được <strong>hoàn lại vào kho hàng</strong>.
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
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Danh sách xe</span>
                </button>

                <a
                    href={`/tra-cuu/${vehicle.plateNormalized}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 text-xs font-semibold active:scale-95 transition-all"
                    title="Mở cổng tra cứu công khai như khách xem"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cổng tra cứu khách</span>
                    <span className="sm:hidden">Tra cứu</span>
                </a>
            </div>

            {/* THẺ TỔNG QUAN PHƯƠNG TIỆN (HERO CARD) - ĐÃ BỎ ODO */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 sm:space-y-5">
                {/* Header Card: Biển số, Dòng xe & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <LicensePlate plate={vehicle.plate} color={vehicle.plateColor} size="md" />
                            <StatusBadge
                                status={vehicle.status}
                                days={vehicle.daysLeft}
                                showDays
                                expiresOn={vehicle.expiresOn ? formatDateVN(vehicle.expiresOn) : undefined}
                            />
                        </div>
                        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{vehicle.model}</h1>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            {vTickets.length} lần
                        </span>
                    </div>
                </div>

                {/* Thông tin Chủ xe & Hạn bảo hành (Grid 2 cột trên mobile, 3 cột trên tablet+) - ĐÃ BỎ ODO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
                    {/* Chủ xe */}
                    <div className="space-y-1">
                        <span className="text-slate-400 uppercase font-bold tracking-wider text-[11px] flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            Chủ Xe
                        </span>
                        <div className="font-bold text-sm text-slate-900 truncate">
                            {vehicle.ownerName || "Chưa có tên chủ xe"}
                        </div>
                    </div>

                    {/* Số điện thoại & Nút gọi 1-chạm */}
                    <div className="space-y-1">
                        <span className="text-slate-400 uppercase font-bold tracking-wider text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            Số Điện Thoại
                        </span>
                        <div className="flex items-center gap-2">
                            {vehicle.ownerPhone ? (
                                <>
                                    <span className="font-mono font-bold text-slate-900 text-sm">
                                        {vehicle.ownerPhone}
                                    </span>
                                    <a
                                        href={`tel:${vehicle.ownerPhone}`}
                                        onClick={() => trigger("tap")}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0 transition-colors"
                                        title={`Gọi ${vehicle.ownerPhone}`}
                                    >
                                        <Phone className="w-3 h-3 fill-current" />
                                        <span>Gọi</span>
                                    </a>
                                </>
                            ) : (
                                <span className="text-slate-400 font-mono">—</span>
                            )}
                        </div>
                    </div>

                    {/* Hạn dài nhất */}
                    <div className="space-y-1">
                        <span className="text-slate-400 uppercase font-bold tracking-wider text-[11px] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Hạn BH Dài Nhất
                        </span>
                        <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{vehicle.expiresOn ? formatDateVN(vehicle.expiresOn) : "Chưa có"}</span>
                        </div>
                    </div>
                </div>

                {/* Action Button: Tạo Phiếu Mới Cho Xe Này */}
                <div className="pt-1">
                    <button
                        type="button"
                        onClick={handleCreateNewTicketForThisVehicle}
                        className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Tạo Phiếu Bảo Hành Cho Xe Này</span>
                    </button>
                </div>
            </div>

            {/* LỊCH SỬ CÁC PHIẾU BẢO HÀNH (TIMELINE CARDS) - ĐÃ BỎ ODO */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Lịch Sử ({vTickets.length} lần)
                    </h2>
                </div>

                {vTickets.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {vTickets.map((t, idx) => (
                            <div key={t.id} className="relative group">
                                {/* Ticket Card */}
                                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all space-y-3.5">
                                    {/* Header phiếu: Đợt X, Ngày kích hoạt, Hạn BH & Nút hành động */}
                                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-extrabold text-sm text-slate-900">
                                                    Lần {vTickets.length - idx}
                                                </span>
                                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                                                    Ngày {formatDateVN(t.activatedOn)}
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
                                                        odo: t.odo,
                                                        note: t.note,
                                                        items: t.items.map((it) => ({
                                                            partId: it.partId || "",
                                                            quantity: it.quantity,
                                                        })),
                                                    });
                                                }}
                                                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Sửa</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTicket(t.id)}
                                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                                                title="Xóa phiếu"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Danh sách phụ tùng trong phiếu */}
                                    <div className="space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                            <Wrench className="w-3 h-3 text-slate-400" />
                                            Phụ tùng lắp đặt ({t.items.length})
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {t.items.map((item, iIdx) => {
                                                const isUnlimited = !item.expiresOn || item.warrantyMonths === 0;
                                                const itemDaysLeft = isUnlimited ? null : daysLeft(item.expiresOn);
                                                const itemStatus = isUnlimited
                                                    ? "unlimited"
                                                    : getStatus(itemDaysLeft!, settings?.expiringThresholdDays ?? 30);
                                                const percent = isUnlimited
                                                    ? 100
                                                    : progressPercent(t.activatedOn, item.expiresOn);
                                                const statusConfig = getWarrantyStatusConfig(itemStatus, itemDaysLeft);

                                                return (
                                                    <div
                                                        key={item.id || iIdx}
                                                        className={`rounded-xl border border-slate-200/90 border-l-[3.5px] ${statusConfig.accentBorder} bg-white p-3 sm:p-3.5 space-y-2 shadow-2xs transition-all hover:shadow-xs`}
                                                    >
                                                        {/* 1. Tên linh kiện & số lượng */}
                                                        <div className="flex items-center justify-between gap-2.5 min-w-0">
                                                            <h4
                                                                className="font-bold text-slate-900 text-xs sm:text-sm leading-snug truncate min-w-0 flex-1"
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

                                                            {/* Thanh tiến trình thời gian */}
                                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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
                                                                        {formatDateVN(t.activatedOn)}
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
                                        <div className="text-xs text-slate-600 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
                                            <span className="font-bold text-slate-700">Ghi chú:</span> {t.note}
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

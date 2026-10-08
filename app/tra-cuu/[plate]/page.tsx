"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useGarageStore } from "@/lib/store/garage-store";
import { normalizePlate } from "@/lib/plate";
import { formatDateVN, formatOdo } from "@/lib/format";
import { progressPercent } from "@/lib/warranty";
import { LicensePlate } from "@/components/domain/license-plate";
import { StatusBadge } from "@/components/domain/status-badge";
import { MaskedPhone } from "@/components/domain/masked-phone";
import {
    Wrench,
    Phone,
    Package,
    ArrowLeft,
    SearchX,
    Calendar,
    User,
    FileText,
    Gauge,
} from "lucide-react";

export default function TraCuuPlatePage() {
    const params = useParams();
    const router = useRouter();
    const rawPlate = (params?.plate as string) || "";
    const plateNorm = normalizePlate(rawPlate);

    const { settings, lookupWarranty, isLoaded } = useGarageStore();
    const data = lookupWarranty(plateNorm);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 force-light">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    // ==========================================
    // MÀN HÌNH KHÔNG TÌM THẤY HỒ SƠ XE (PHƯƠNG ÁN 3)
    // ==========================================
    if (!data) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between force-light">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.push("/tra-cuu")}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                    </button>

                    <Link href="/tra-cuu" className="flex items-center">
                        <Image
                            src="/logo-duy-auto-remove-bg-v1.png"
                            alt="Duy Auto Logo"
                            width={140}
                            height={60}
                            priority
                            className="h-8 sm:h-9 w-auto object-contain"
                        />
                    </Link>

                    {settings.hotline && (
                        <a
                            href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                            className="touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors shadow-2xs"
                            title="Gọi Hotline Gara"
                        >
                            <Phone className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">
                                {settings.hotline}
                            </span>
                        </a>
                    )}
                </header>

                {/* Main Content Not Found */}
                <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-md w-full mx-auto my-auto text-center space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mx-auto shadow-2xs">
                        <SearchX className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    <div className="space-y-1.5">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                            Không Tìm Thấy Hồ Sơ Bảo Hành
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Chưa có dữ liệu bảo dưỡng điện tử cho biển số xe
                            này:
                        </p>
                        <div className="pt-2 flex justify-center">
                            <LicensePlate plate={rawPlate} size="md" />
                        </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs leading-relaxed text-balance">
                        Nếu xe của bạn vừa hoàn tất dịch vụ hoặc thay phụ tùng,
                        vui lòng liên hệ trực tiếp xưởng để nhân viên kích hoạt
                        tem bảo hành.
                    </p>

                    <div className="w-full space-y-2 pt-2">
                        {settings.hotline && (
                            <a
                                href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                                className="touch-target w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm shadow-blue-500/20"
                            >
                                <Phone className="w-4 h-4 fill-current" />
                                <span>Gọi Hỗ Trợ Gara: {settings.hotline}</span>
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => router.push("/tra-cuu")}
                            className="touch-target w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer"
                        >
                            Tra cứu biển số khác
                        </button>
                    </div>
                </main>

                <footer className="p-3 text-center text-xs text-slate-400">
                    <span>Hệ thống bảo hành Duy.lamxedao.thuduc</span>
                </footer>
            </div>
        );
    }

    // ==========================================
    // MÀN HÌNH ĐÃ TÌM THẤY HỒ SƠ XE (PHƯƠNG ÁN 1)
    // ==========================================
    const firstTicket = data.tickets[data.tickets.length - 1];
    const totalItems = data.tickets.reduce((acc, t) => acc + t.items.length, 0);
    const percent = firstTicket
        ? progressPercent(firstTicket.activatedOn, data.expiresOn)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between force-light">
            {/* Header Gara */}
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/tra-cuu")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Tra cứu khác</span>
                    </button>
                    <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                    <Link
                        href="/tra-cuu"
                        className="hidden sm:flex items-center"
                    >
                        <Image
                            src="/logo-duy-auto-remove-bg-v1.png"
                            alt="Duy Auto Logo"
                            width={140}
                            height={60}
                            priority
                            className="h-8 sm:h-9 w-auto object-contain"
                        />
                    </Link>
                </div>

                <div className="flex items-center shrink-0">
                    {settings.hotline && (
                        <a
                            href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                            className="touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors shadow-2xs active:scale-95"
                            title="Gọi Hotline Gara"
                        >
                            <Phone className="w-3.5 h-3.5 fill-current" />
                            <span>{settings.hotline}</span>
                        </a>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                {/* THẺ BẢO HÀNH CHÍNH (CÓ MINI PROGRESS BAR) */}
                <section className="rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
                    {/* Dải line màu thương hiệu tinh tế trên đỉnh thẻ */}
                    <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500" />

                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                        {/* Hàng 1: Biển số, Model & Status Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <LicensePlate
                                    plate={data.plate}
                                    color={data.plateColor}
                                    size="md"
                                />
                                <div>
                                    <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                                        {data.model}
                                    </h1>
                                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                                        <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>
                                            ODO:{" "}
                                            <strong className="text-slate-700">
                                                {formatOdo(data.odo)}
                                            </strong>{" "}
                                            km
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hàng 2: Hộp Thời hạn bảo hành & Tiến độ (Row riêng rộng rãi) */}
                        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-blue-600 font-semibold uppercase tracking-wider text-2xs flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        <span>Hiệu lực bảo hành</span>
                                    </span>
                                    <div className="pt-0.5">
                                        <StatusBadge status={data.status} />
                                    </div>
                                </div>
                                {data.status !== "expired" ? (
                                    <div className="text-right">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
                                            Thời gian còn
                                        </span>
                                        <span className="text-sm font-mono font-bold text-blue-700">
                                            {data.daysLeft} ngày
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
                                            Thời gian còn
                                        </span>
                                        <span className="text-sm font-mono font-bold text-slate-500">
                                            Đã hết hạn
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Progress bar toàn chiều ngang */}
                            <div className="w-full h-2 bg-blue-100/70 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        data.status === "active"
                                            ? "bg-emerald-500"
                                            : data.status === "expiring"
                                              ? "bg-amber-500"
                                              : "bg-slate-300"
                                    }`}
                                    style={{
                                        width: `${data.status === "expired" ? 0 : percent}%`,
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-2xs font-mono text-slate-500 pt-0.5">
                                <span>
                                    Kích hoạt:{" "}
                                    <strong className="text-slate-700 font-semibold">
                                        {formatDateVN(
                                            firstTicket?.activatedOn || "",
                                        )}
                                    </strong>
                                </span>
                                <span>
                                    Hết hạn:{" "}
                                    <strong className="text-slate-700 font-semibold">
                                        {formatDateVN(data.expiresOn)}
                                    </strong>
                                </span>
                            </div>
                        </div>

                        {/* Hàng 3: Khối Chủ xe & Số điện thoại (Row riêng) */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                                    <User className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <span className="block text-2xs text-slate-400 font-semibold uppercase tracking-wider">
                                        Chủ xe
                                    </span>
                                    <span className="font-bold text-slate-900 text-sm">
                                        {data.ownerName || "Chưa đăng ký"}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="block text-2xs text-slate-400 font-semibold uppercase tracking-wider">
                                    Số điện thoại
                                </span>
                                <div className="text-sm font-mono font-medium text-slate-700 mt-0.5">
                                    <MaskedPhone
                                        masked={data.ownerPhoneMasked}
                                        full={data.ownerPhoneFull}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DANH SÁCH CÁC PHIẾU BẢO HÀNH & PHỤ TÙNG */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <span className="p-1 rounded-md bg-blue-50 text-blue-600">
                                <Package className="w-3.5 h-3.5" />
                            </span>
                            <span>
                                Chi tiết linh kiện & phụ tùng ({totalItems} món)
                            </span>
                        </h2>
                        <span className="text-xs text-slate-400 font-medium">
                            {data.tickets.length} lần vào xưởng
                        </span>
                    </div>

                    <div className="space-y-3">
                        {data.tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden"
                            >
                                {/* Header Phiếu: Phối màu nền xanh nhẹ nhàng */}
                                <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                                        <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                            <Wrench className="w-3.5 h-3.5" />
                                        </div>
                                        <span>
                                            Bảo dưỡng ngày:{" "}
                                            {formatDateVN(ticket.activatedOn)}
                                        </span>
                                    </div>
                                    {ticket.odo > 0 && (
                                        <span className="text-slate-500 font-mono text-2xs bg-slate-100 px-2 py-0.5 rounded-md">
                                            ODO: {formatOdo(ticket.odo)} km
                                        </span>
                                    )}
                                </div>

                                {/* Các món phụ tùng trong phiếu */}
                                <div className="p-3.5 sm:p-4 divide-y divide-slate-100">
                                    {ticket.items.map((item, iIdx) => {
                                        const isExpired =
                                            new Date(item.expiresOn) <
                                            new Date();
                                        return (
                                            <div
                                                key={iIdx}
                                                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs sm:text-sm"
                                            >
                                                <div className="space-y-0.5 min-w-0 pr-2">
                                                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                        <span className="truncate">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-2xs px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-100/80 font-mono font-bold shrink-0">
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="text-2xs text-slate-500 font-mono">
                                                        {item.serial && (
                                                            <span>
                                                                Mã tem:{" "}
                                                                <strong className="text-slate-700">
                                                                    {
                                                                        item.serial
                                                                    }
                                                                </strong>{" "}
                                                                •{" "}
                                                            </span>
                                                        )}
                                                        <span>
                                                            Bảo hành{" "}
                                                            {
                                                                item.warrantyMonths
                                                            }
                                                            T • Hạn đến:{" "}
                                                            <span className="text-slate-700 font-medium">
                                                                {formatDateVN(
                                                                    item.expiresOn,
                                                                )}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0">
                                                    {isExpired ? (
                                                        <span className="text-2xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200/60 whitespace-nowrap">
                                                            Hết hạn
                                                        </span>
                                                    ) : (
                                                        <span className="text-2xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 ring-1 ring-emerald-500/10 whitespace-nowrap">
                                                            Còn hạn
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Ghi chú kỹ thuật nếu có */}
                                {ticket.note && (
                                    <div className="px-4 py-2 bg-amber-50/40 border-t border-amber-100/60 text-2xs text-amber-900/80 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span>
                                            Ghi chú xưởng:{" "}
                                            <em>{ticket.note}</em>
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer tối giản */}
            <footer className="p-3 text-center text-xs text-slate-400">
                <span>Hệ thống bảo hành Duy.lamxedao.thuduc</span>
            </footer>
        </div>
    );
}

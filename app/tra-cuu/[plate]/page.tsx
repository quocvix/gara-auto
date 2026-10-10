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
import {
    Wrench,
    Phone,
    ArrowLeft,
    SearchX,
    Calendar,
    User,
    FileText,
    Gauge,
    ShieldCheck,
    Clock,
    AlertCircle,
    XCircle,
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    // ==========================================
    // MÀN HÌNH KHÔNG TÌM THẤY HỒ SƠ XE
    // ==========================================
    if (!data) {
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

                {/* Header: Quay lại bên trái, Logo Duy Auto bên phải (bỏ hotline) */}
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

                    <p className="text-xs text-slate-600 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-xs leading-relaxed text-balance">
                        Nếu xe của bạn vừa hoàn tất dịch vụ hoặc lắp đặt phụ
                        kiện, vui lòng liên hệ trực tiếp xưởng để nhân viên kích
                        hoạt tem bảo hành điện tử.
                    </p>

                    <div className="w-full space-y-2 pt-1">
                        {settings.hotline && (
                            <a
                                href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                                className="touch-target inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-red-200/80 bg-red-50/70 hover:bg-red-50 active:scale-[0.99] text-red-600 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
                            >
                                <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                                <span>
                                    Cần hỗ trợ? Gọi Hotline:{" "}
                                    <strong>{settings.hotline}</strong>
                                </span>
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => router.push("/tra-cuu")}
                            className="touch-target w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        >
                            Tra cứu biển số khác
                        </button>
                    </div>
                </main>

                <footer className="relative z-10 p-3 text-center text-2xs text-slate-400 font-medium">
                    <span>Hệ thống bảo hành Duy.lamxedao.thuduc</span>
                </footer>
            </div>
        );
    }

    // ==========================================
    // MÀN HÌNH ĐÃ TÌM THẤY HỒ SƠ XE (REDESIGN AUTOMOTIVE TECH)
    // ==========================================
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

            {/* Header Gara: Nút quay lại bên trái, Logo thương hiệu bên phải (bỏ hotline) */}
            <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-2xs">
                <button
                    type="button"
                    onClick={() => router.push("/tra-cuu")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Tra cứu khác</span>
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

            {/* Main Content */}
            <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-3.5 py-4 sm:p-6 space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
                {/* THẺ HỒ SƠ PHƯƠNG TIỆN (TỐI ƯU MOBILE HERO PLATE & 2 CỘT CÂN ĐỐI) */}
                <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-xs relative overflow-hidden">
                    {/* Dải line màu thương hiệu kỹ thuật trên đỉnh thẻ */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

                    <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                        {/* Biển số xe & Tên dòng xe: Mobile xếp dọc thoáng mắt, Desktop xếp ngang */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex justify-center sm:justify-start">
                                    <LicensePlate
                                        plate={data.plate}
                                        color={data.plateColor}
                                        size="md"
                                    />
                                </div>
                                <div className="text-center sm:text-left min-w-0">
                                    <span className="inline-block text-3xs uppercase tracking-widest font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/80">
                                        Hồ sơ phương tiện
                                    </span>
                                    <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl leading-tight mt-1 text-balance">
                                        {data.model}
                                    </h1>
                                    <div className="text-xs text-slate-500 font-mono mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                                        <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>
                                            ODO:{" "}
                                            <strong className="text-slate-800 font-bold">
                                                {formatOdo(data.odo)}
                                            </strong>{" "}
                                            km
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Khối Chủ xe & Số điện thoại: Chuyển sang 2 hàng dọc (Vertical Stack), hiển thị trọn vẹn họ tên dài không bị truncate */}
                        <div className="border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 px-3.5 sm:px-5 py-2.5 divide-y divide-slate-200/60 rounded-b-2xl text-xs">
                            {/* Hàng 1: Chủ xe */}
                            <div className="flex items-center gap-2.5 sm:gap-3 py-2 first:pt-0">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="block text-2xs text-slate-400 font-bold uppercase tracking-wider">
                                        Chủ xe
                                    </span>
                                    <span className="font-extrabold text-slate-900 text-sm leading-snug break-words block">
                                        {data.ownerName || "Khách hàng"}
                                    </span>
                                </div>
                            </div>

                            {/* Hàng 2: Số điện thoại */}
                            <div className="flex items-center gap-2.5 sm:gap-3 py-2 last:pb-0">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="block text-2xs text-slate-400 font-bold uppercase tracking-wider">
                                        Điện thoại
                                    </span>
                                    <span className="font-mono font-extrabold text-slate-800 text-sm tracking-wider block">
                                        {data.ownerPhoneMasked || "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DANH SÁCH CÁC ĐỢT LÀM XE THEO NGÀY (TIMELINE) */}
                <section className="space-y-3 sm:space-y-3.5">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                                <Wrench className="w-3.5 h-3.5" />
                            </span>
                            <span>
                                Lịch sử bảo dưỡng ({data.tickets.length} lần vào
                                xưởng)
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-3.5 sm:space-y-4">
                        {data.tickets.map((ticket, tIdx) => {
                            const isLatest = tIdx === 0;
                            const visitNumber = data.tickets.length - tIdx;

                            return (
                                <div
                                    key={ticket.id}
                                    className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-2xs overflow-hidden"
                                >
                                    {/* Header Đợt làm việc: Co giãn mượt mà trên mobile */}
                                    <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2 font-bold text-slate-900 min-w-0">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold font-mono tracking-wider shrink-0 ${
                                                    isLatest
                                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                                                        : "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                LẦN {visitNumber}
                                                {isLatest && " • MỚI NHẤT"}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-600 font-medium text-xs shrink-0">
                                                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                <span className="font-mono">
                                                    {formatDateVN(
                                                        ticket.activatedOn,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danh sách từng phụ kiện & Tiến trình bảo hành riêng */}
                                    <div className="p-3.5 sm:p-4 divide-y divide-slate-100">
                                        {ticket.items.map((item, iIdx) => {
                                            const isUnlimited =
                                                item.status === "unlimited";
                                            const percent = isUnlimited
                                                ? 100
                                                : progressPercent(
                                                      ticket.activatedOn,
                                                      item.expiresOn,
                                                  );

                                            return (
                                                <div
                                                    key={item.id || iIdx}
                                                    className="py-3.5 first:pt-0 last:pb-0 space-y-2.5 text-xs"
                                                >
                                                    {/* Thông tin phụ kiện */}
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-sm font-extrabold text-slate-900 leading-snug">
                                                                {item.name}
                                                            </span>
                                                            <span className="text-2xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono font-bold shrink-0">
                                                                x{item.quantity}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar riêng cho từng phụ kiện */}
                                                    <div className="pt-1.5 space-y-1">
                                                        <div className="flex items-center justify-between text-3xs font-mono mb-1 gap-2">
                                                            <span className="text-slate-500 font-medium truncate">
                                                                {isUnlimited
                                                                    ? "Tiến trình hiệu lực"
                                                                    : "Thời hạn bảo hành"}
                                                            </span>
                                                            <div className="shrink-0">
                                                                {item.status ===
                                                                    "unlimited" && (
                                                                    <span className="inline-flex items-center gap-1 text-2xs px-2 sm:px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-extrabold border border-indigo-300/90 ring-2 ring-indigo-500/15 shadow-2xs whitespace-nowrap">
                                                                        <Clock className="w-3 h-3 text-indigo-600" />
                                                                        <span>
                                                                            Không
                                                                            cố
                                                                            định
                                                                        </span>
                                                                    </span>
                                                                )}
                                                                {item.status ===
                                                                    "active" && (
                                                                    <span className="inline-flex items-center gap-1 text-2xs px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-extrabold border border-emerald-300/90 ring-2 ring-emerald-500/15 shadow-2xs whitespace-nowrap">
                                                                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                                                        <span>
                                                                            Còn
                                                                            hạn
                                                                            {typeof item.daysLeft ===
                                                                                "number" &&
                                                                                ` • ${item.daysLeft} ngày`}
                                                                        </span>
                                                                    </span>
                                                                )}
                                                                {item.status ===
                                                                    "expiring" && (
                                                                    <span className="inline-flex items-center gap-1 text-2xs px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono font-extrabold border border-amber-300/90 ring-2 ring-amber-500/20 shadow-2xs whitespace-nowrap">
                                                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                                                        <span>
                                                                            Sắp
                                                                            hết
                                                                            {typeof item.daysLeft ===
                                                                                "number" &&
                                                                                ` • ${item.daysLeft} ngày`}
                                                                        </span>
                                                                    </span>
                                                                )}
                                                                {item.status ===
                                                                    "expired" && (
                                                                    <span className="inline-flex items-center gap-1 text-2xs px-2 sm:px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-mono font-extrabold border border-red-300/90 ring-2 ring-red-500/20 shadow-2xs whitespace-nowrap">
                                                                        <XCircle className="w-3 h-3 text-red-600" />
                                                                        <span>
                                                                            Đã
                                                                            hết
                                                                            hạn
                                                                        </span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    isUnlimited
                                                                        ? "bg-gradient-to-r from-indigo-500 to-blue-500"
                                                                        : item.status ===
                                                                            "active"
                                                                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                                          : item.status ===
                                                                              "expiring"
                                                                            ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                                                            : "bg-slate-300"
                                                                }`}
                                                                style={{
                                                                    width: `${item.status === "expired" ? 0 : percent}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        {/* Ngày kích hoạt và ngày hết hạn chuyển nằm dưới thanh progress */}
                                                        <div className="flex items-center justify-between text-3xs font-mono text-slate-400 pt-0.5">
                                                            {isUnlimited ? (
                                                                <>
                                                                    <span>
                                                                        <span className="hidden sm:inline text-slate-400">
                                                                            Bắt
                                                                            đầu:{" "}
                                                                        </span>
                                                                        <span className="sm:hidden text-slate-400">
                                                                            Từ:{" "}
                                                                        </span>
                                                                        <strong className="text-slate-600 font-semibold">
                                                                            {formatDateVN(
                                                                                ticket.activatedOn,
                                                                            )}
                                                                        </strong>
                                                                    </span>
                                                                    <span className="text-indigo-600 font-semibold text-right">
                                                                        Không cố
                                                                        định hạn
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>
                                                                        <span className="hidden sm:inline text-slate-400">
                                                                            Kích
                                                                            hoạt:{" "}
                                                                        </span>
                                                                        <span className="sm:hidden text-slate-400">
                                                                            Từ:{" "}
                                                                        </span>
                                                                        <strong className="text-slate-600 font-semibold">
                                                                            {formatDateVN(
                                                                                ticket.activatedOn,
                                                                            )}
                                                                        </strong>
                                                                    </span>
                                                                    <span className="text-right">
                                                                        <span className="hidden sm:inline text-slate-400">
                                                                            Hết
                                                                            hạn:{" "}
                                                                        </span>
                                                                        <span className="sm:hidden text-slate-400">
                                                                            Đến:{" "}
                                                                        </span>
                                                                        <strong className="text-slate-600 font-semibold">
                                                                            {formatDateVN(
                                                                                item.expiresOn,
                                                                            )}
                                                                        </strong>
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Ghi chú xưởng nếu có - đặt ở dưới cùng của đợt bảo dưỡng */}
                                    {ticket.note && (
                                        <div className="px-3.5 sm:px-4 py-2.5 bg-amber-50/60 border-t border-amber-100/80 text-2xs text-amber-900 flex items-start gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                            <span>
                                                Ghi chú xưởng:{" "}
                                                <strong className="font-semibold text-amber-950">
                                                    {ticket.note}
                                                </strong>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Hotline liên hệ hỗ trợ gara */}
                {settings.hotline && (
                    <div className="pt-2">
                        <a
                            href={`tel:${settings.hotline.replace(/\s+/g, "")}`}
                            className="touch-target inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-red-200/80 bg-red-50/70 hover:bg-red-50 active:scale-[0.99] text-red-600 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
                        >
                            <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>
                                Cần hỗ trợ? Gọi Hotline:{" "}
                                <strong>{settings.hotline}</strong>
                            </span>
                        </a>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-3.5 text-center text-2xs text-slate-400 font-medium">
                <span>Hệ thống bảo hành Duy.lamxedao.thuduc</span>
            </footer>
        </div>
    );
}

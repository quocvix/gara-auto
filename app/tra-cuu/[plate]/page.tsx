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
    Package,
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
            <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-3.5 py-4 sm:p-6 space-y-3.5 sm:space-y-5 animate-fade-in">
                {/* THẺ HỒ SƠ PHƯƠNG TIỆN */}
                <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-xs relative overflow-hidden">
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

                        {/* Khối Chủ xe & Số điện thoại: Liền mạch cùng một khối, không border ngăn cách */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1.5">
                            {/* Hàng 1: Chủ xe */}
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
                                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight break-words block">
                                        {data.ownerName || "Khách hàng"}
                                    </span>
                                </div>
                            </div>

                            {/* Hàng 2: Số điện thoại */}
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
                                    <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-mono font-extrabold text-slate-800 text-base sm:text-lg tracking-wider leading-tight block">
                                        {data.ownerPhoneMasked || "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DANH SÁCH CÁC ĐỢT LÀM XE THEO NGÀY (TIMELINE) */}
                <section className="space-y-3.5 sm:space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                                <Wrench className="w-3.5 h-3.5" />
                            </span>
                            <span>Lịch sử bảo dưỡng & linh kiện</span>
                        </h2>
                        <span className="text-3xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            {data.tickets.length} đợt vào xưởng
                        </span>
                    </div>

                    <div className="space-y-5 sm:space-y-6">
                        {data.tickets.map((ticket, tIdx) => {
                            const isLatest = tIdx === 0;
                            const visitNumber = data.tickets.length - tIdx;

                            return (
                                <div
                                    key={ticket.id}
                                    className="space-y-3"
                                >
                                    {/* Header Đợt làm xe: Lần X + ODO + Ngày */}
                                    <div className="flex items-center justify-between gap-2 px-1 text-xs">
                                        <div className="flex items-center gap-2">
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
                                        </div>

                                        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs shrink-0">
                                            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                            <span className="font-mono text-2xs sm:text-xs">
                                                {formatDateVN(
                                                    ticket.activatedOn,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Danh sách từng phụ kiện: Thẻ E-Warranty chuẩn hiện đại */}
                                    <div className="space-y-3 sm:space-y-3.5">
                                        {ticket.items.map((item, iIdx) => {
                                            const isUnlimited =
                                                item.status === "unlimited";
                                            const percent = isUnlimited
                                                ? 100
                                                : progressPercent(
                                                      ticket.activatedOn,
                                                      item.expiresOn,
                                                  );

                                            // Bộ cấu hình trạng thái màu sắc chuẩn UI/UX
                                            const statusMap: Record<
                                                string,
                                                {
                                                    bannerBg: string;
                                                    dotColor: string;
                                                    title: string;
                                                    badgeBg: string;
                                                    badgeText: string;
                                                    barGradient: string;
                                                }
                                            > = {
                                                active: {
                                                    bannerBg:
                                                        "bg-emerald-50/90 border-emerald-200/70 text-emerald-800",
                                                    dotColor: "bg-emerald-500",
                                                    title: "CÒN HIỆU LỰC BẢO HÀNH",
                                                    badgeBg:
                                                        "bg-emerald-600 text-white",
                                                    badgeText:
                                                        typeof item.daysLeft ===
                                                        "number"
                                                            ? `Còn ${item.daysLeft} ngày`
                                                            : "Còn hiệu lực",
                                                    barGradient:
                                                        "bg-gradient-to-r from-emerald-500 to-teal-400",
                                                },
                                                expiring: {
                                                    bannerBg:
                                                        "bg-amber-50/90 border-amber-200/70 text-amber-800",
                                                    dotColor: "bg-amber-500",
                                                    title: "SẮP HẾT HẠN BẢO HÀNH",
                                                    badgeBg:
                                                        "bg-amber-600 text-white",
                                                    badgeText:
                                                        typeof item.daysLeft ===
                                                        "number"
                                                            ? `Còn ${item.daysLeft} ngày`
                                                            : "Sắp hết hạn",
                                                    barGradient:
                                                        "bg-gradient-to-r from-amber-500 to-orange-400",
                                                },
                                                expired: {
                                                    bannerBg:
                                                        "bg-red-50/90 border-red-200/70 text-red-800",
                                                    dotColor: "bg-red-500",
                                                    title: "ĐÃ HẾT HẠN BẢO HÀNH",
                                                    badgeBg:
                                                        "bg-red-600 text-white",
                                                    badgeText: "Đã hết hạn",
                                                    barGradient: "bg-slate-400",
                                                },
                                                unlimited: {
                                                    bannerBg:
                                                        "bg-indigo-50/90 border-indigo-200/70 text-indigo-800",
                                                    dotColor: "bg-indigo-500",
                                                    title: "BẢO HÀNH LINH HOẠT",
                                                    badgeBg:
                                                        "bg-indigo-600 text-white",
                                                    badgeText: "Không cố định",
                                                    barGradient:
                                                        "bg-gradient-to-r from-indigo-500 to-blue-500",
                                                },
                                            };

                                            const currentStatus =
                                                statusMap[item.status] ||
                                                statusMap.active;

                                            return (
                                                <div
                                                    key={item.id || iIdx}
                                                    className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all hover:shadow-xs"
                                                >
                                                    {/* 1. Header Banner Trạng Thái Bảo Hành */}
                                                    <div
                                                        className={`px-3.5 sm:px-4 py-2 border-b flex items-center justify-between gap-2 text-xs font-semibold ${currentStatus.bannerBg}`}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span
                                                                className={`w-2 h-2 rounded-full shrink-0 ${currentStatus.dotColor} ${
                                                                    item.status ===
                                                                    "active"
                                                                        ? "animate-pulse"
                                                                        : ""
                                                                }`}
                                                            />
                                                            <span className="font-extrabold uppercase tracking-wide text-2xs sm:text-xs truncate">
                                                                {currentStatus.title}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-3xs sm:text-2xs shadow-2xs shrink-0 ${currentStatus.badgeBg}`}
                                                        >
                                                            {currentStatus.badgeText}
                                                        </span>
                                                    </div>

                                                    {/* 2. Thân Thẻ: Chi tiết linh kiện & sub-boxes */}
                                                    <div className="p-3.5 sm:p-4 space-y-3">
                                                        {/* Thông tin tên linh kiện & Tag bảo hành */}
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50/90 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/70 shadow-2xs">
                                                                <Package className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
                                                            </div>
                                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60 tracking-wider">
                                                                        {item.warrantyMonths
                                                                            ? `Bảo hành ${item.warrantyMonths} tháng`
                                                                            : "Linh kiện bảo dưỡng"}
                                                                    </span>
                                                                    {item.quantity >
                                                                        1 && (
                                                                        <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                                                            SL: x{item.quantity}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                                                                    {item.name}
                                                                </h3>
                                                            </div>
                                                        </div>


                                                        {/* Sub-box: Thời hạn bảo hành & Thanh Progress */}
                                                        <div className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-2.5 sm:p-3 space-y-2">
                                                            <div className="flex items-center justify-between gap-2 text-xs">
                                                                <span className="flex items-center gap-1.5 font-semibold text-slate-700 text-2xs sm:text-xs">
                                                                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                                    <span>
                                                                        {isUnlimited
                                                                            ? "Thời hạn bảo hành"
                                                                            : `Thời hạn bảo hành ${
                                                                                  item.warrantyMonths
                                                                                      ? `(${item.warrantyMonths} tháng)`
                                                                                      : ""
                                                                              }`}
                                                                    </span>
                                                                </span>
                                                                <span className="font-mono font-extrabold text-slate-900 text-2xs sm:text-xs">
                                                                    {isUnlimited
                                                                        ? "Không cố định"
                                                                        : formatDateVN(
                                                                              item.expiresOn,
                                                                          )}
                                                                </span>
                                                            </div>

                                                            {/* Thanh tiến trình thời gian */}
                                                            <div className="h-1.5 sm:h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${currentStatus.barGradient}`}
                                                                    style={{
                                                                        width: `${
                                                                            item.status ===
                                                                            "expired"
                                                                                ? 0
                                                                                : percent
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>

                                                            {/* Dòng ngày tháng chi tiết */}
                                                            <div className="flex items-center justify-between text-3xs font-mono text-slate-400">
                                                                <span>
                                                                    Lắp:{" "}
                                                                    <strong className="text-slate-600 font-semibold">
                                                                        {formatDateVN(
                                                                            ticket.activatedOn,
                                                                        )}
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
                                                                            <strong className="text-slate-600 font-semibold">
                                                                                {formatDateVN(
                                                                                    item.expiresOn,
                                                                                )}
                                                                            </strong>
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>


                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Ghi chú xưởng nếu có */}
                                    {ticket.note && (
                                        <div className="rounded-xl px-3.5 py-2.5 bg-amber-50/70 border border-amber-200/80 text-2xs text-amber-900 flex items-start gap-2 shadow-2xs">
                                            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-semibold text-amber-800 uppercase tracking-wider text-3xs block">
                                                    Ghi chú kỹ thuật viên
                                                </span>
                                                <span className="font-medium text-amber-950">
                                                    {ticket.note}
                                                </span>
                                            </div>
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
        </div>
    );
}

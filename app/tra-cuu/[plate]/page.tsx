"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useGarageStore } from "@/lib/store/garage-store";
import { normalizePlate } from "@/lib/plate";
import { formatDateVN } from "@/lib/format";
import { progressPercent } from "@/lib/warranty";
import { LicensePlate } from "@/components/domain/license-plate";
import { WarrantyNotFound } from "@/components/domain/warranty-not-found";
import { GarageSupportActions } from "@/components/domain/garage-support-actions";
import { getWarrantyStatusConfig } from "@/lib/warranty-status";
import { getCarColorConfig } from "@/lib/car-colors";
import { Phone, ArrowLeft, Calendar, User, FileText, Clock, ClipboardClock } from "lucide-react";

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
        return <WarrantyNotFound plate={rawPlate} settings={settings} />;
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
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 min-h-9.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Tra cứu khác</span>
                </button>

                <Link href="/tra-cuu" className="flex items-center hover:opacity-95 transition-opacity">
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
                        <div className="flex sm:flex-col items-start gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex justify-start">
                                    <LicensePlate plate={data.plate} color={data.plateColor} size="md" />
                                </div>
                                <div className="text-left min-w-0 space-y-1">
                                    <h1 className="font-extrabold text-slate-900 text-lg sm:text-xl leading-tight text-balance">
                                        {data.model}
                                    </h1>
                                    {getCarColorConfig(data.color) && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                                style={{
                                                    backgroundColor: getCarColorConfig(data.color)?.hex,
                                                    border: getCarColorConfig(data.color)?.border
                                                        ? `1px solid ${getCarColorConfig(data.color)?.border}`
                                                        : "1px solid rgba(0,0,0,0.15)",
                                                }}
                                            />
                                            <span>Màu {getCarColorConfig(data.color)?.name}</span>
                                        </div>
                                    )}
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
                                    <span className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight wrap-break-word block">
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
                <section className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                                <ClipboardClock className="w-3.5 h-3.5" />
                            </span>
                            <span>Lịch sử</span>
                        </h2>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                        {data.tickets.map((ticket, tIdx) => {
                            const isLatest = tIdx === 0;
                            const visitNumber = data.tickets.length - tIdx;

                            return (
                                <div
                                    key={ticket.id}
                                    className={`rounded-2xl sm:rounded-3xl border ${
                                        isLatest
                                            ? "border-blue-200/90 ring-1 ring-blue-500/15 shadow-xs"
                                            : "border-slate-200/90 shadow-2xs"
                                    } bg-white overflow-hidden transition-all`}
                                >
                                    {/* Header Đợt làm xe: Lần X + Ngày */}
                                    <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-linear-to-r from-slate-50 via-slate-50/80 to-blue-50/30 border-b border-slate-200/80 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2.5 py-1.5 rounded-full text-2xs font-bold tracking-wider shrink-0 ${
                                                    isLatest
                                                        ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-xs"
                                                        : "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                LẦN {visitNumber}
                                                {isLatest && " • MỚI NHẤT"}
                                            </span>
                                            {ticket.items.length > 1 && (
                                                <span className="text-3xs font-semibold text-slate-500 hidden xs:inline">
                                                    ({ticket.items.length} hạng mục)
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs shrink-0">
                                            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                            <span className=" text-slate-700 font-bold text-2xs sm:text-xs">
                                                {formatDateVN(ticket.activatedOn)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Danh sách từng phụ kiện: Mỗi linh kiện là 1 Card độc lập có accent border */}
                                    <div className="p-3 sm:p-4 space-y-3 bg-slate-50/70">
                                        {ticket.items.map((item, iIdx) => {
                                            const itemActivatedOn = item.activatedOn || ticket.activatedOn;
                                            const isUnlimited = item.status === "unlimited";
                                            const percent = isUnlimited
                                                ? 100
                                                : progressPercent(itemActivatedOn, item.expiresOn);

                                            // Lấy cấu hình trạng thái từ file chung lib/warranty-status.ts
                                            const currentStatus = getWarrantyStatusConfig(item.status, item.daysLeft);

                                            return (
                                                <div
                                                    key={item.id || iIdx}
                                                    className={`rounded-xl sm:rounded-2xl border border-slate-200/90 border-l-[3.5px] ${currentStatus.accentBorder} bg-white p-3.5 sm:p-4 space-y-2.5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300`}
                                                >
                                                    {/* 2. Chi tiết linh kiện: Tên nằm trái (truncate), SL nằm phải */}
                                                    <div className="flex items-center justify-between gap-3 min-w-0">
                                                        <h3
                                                            className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug truncate min-w-0 flex-1"
                                                            title={item.name}
                                                        >
                                                            {item.name}
                                                        </h3>
                                                        {item.quantity >= 1 && (
                                                            <span className="text-3xs font-extrabold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60 tracking-wider shrink-0 font-mono">
                                                                x{item.quantity}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* 3. Chi tiết thời hạn bảo hành & Thanh Progress: Liền mạch, không lồng hộp thừa */}
                                                    <div className="space-y-2 pt-0.5">
                                                        <div className="flex items-center justify-between gap-2 text-xs">
                                                            <span className="flex items-center gap-1.5 font-semibold text-slate-700 text-2xs sm:text-xs">
                                                                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                                <span>Thời hạn</span>
                                                                {item.warrantyMonths ? (
                                                                    <span className="text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60 tracking-wider font-mono">
                                                                        BH {item.warrantyMonths}T
                                                                    </span>
                                                                ) : (
                                                                    !isUnlimited && (
                                                                        <span className="text-3xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60 tracking-wider">
                                                                            Linh kiện bảo dưỡng
                                                                        </span>
                                                                    )
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-3xs sm:text-2xs shadow-2xs shrink-0 ${currentStatus.badgeBg}`}
                                                            >
                                                                {isUnlimited
                                                                    ? "Không giới hạn"
                                                                    : typeof item.daysLeft === "number"
                                                                      ? item.daysLeft > 0
                                                                          ? `Còn ${item.daysLeft} ngày`
                                                                          : "Đã hết hạn"
                                                                      : currentStatus.badgeText}
                                                            </span>
                                                        </div>

                                                        {/* Thanh tiến trình thời gian */}
                                                        <div className="h-1.5 sm:h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${currentStatus.barGradient}`}
                                                                style={{
                                                                    width: `${
                                                                        item.status === "expired" ? 0 : percent
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
                                                                        <strong className="text-slate-600 font-bold">
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

                                        {/* Ghi chú kỹ thuật viên nếu có (Dạng Memo Card tinh tế) */}
                                        {ticket.note && (
                                            <div className="rounded-xl sm:rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3.5 sm:p-4 shadow-2xs flex items-start gap-3 transition-all">
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-3xs flex items-center gap-1 font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-amber-100/90 text-amber-800 border border-amber-300/60 tracking-wider">
                                                            <FileText className="w-3 h-3 stroke-2" /> Ghi chú
                                                        </span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                                                        {ticket.note}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Hotline & Zalo liên hệ hỗ trợ gara */}
                <GarageSupportActions hotline={settings.hotline} className="pt-1" />
            </main>
        </div>
    );
}

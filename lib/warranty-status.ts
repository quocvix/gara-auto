import type { WarrantyStatus } from "@/types/garage";

export interface WarrantyStatusConfig {
    bannerBg: string;
    dotColor: string;
    title: string;
    badgeBg: string;
    badgeText: string;
    barGradient: string;
    accentBorder: string;
}

/**
 * Lấy cấu hình màu sắc, icon, tiêu đề và badge chuẩn UI/UX cho từng trạng thái bảo hành
 * Có thể tái sử dụng trên mọi trang (Tra cứu bảo hành, Quản trị ticket, Danh sách khách hàng...)
 */
export function getWarrantyStatusConfig(
    status: WarrantyStatus | string,
    daysLeft?: number | null
): WarrantyStatusConfig {
    const isDaysNumber = typeof daysLeft === "number";

    const statusMap: Record<string, WarrantyStatusConfig> = {
        active: {
            bannerBg: "bg-emerald-50/90 border-emerald-200/70 text-emerald-800",
            dotColor: "bg-emerald-500",
            title: "CÒN HIỆU LỰC BẢO HÀNH",
            badgeBg: "bg-emerald-600 text-white",
            badgeText: isDaysNumber
                ? daysLeft > 0
                    ? `Còn ${daysLeft} ngày`
                    : "Hôm nay hết hạn"
                : "Còn hiệu lực",
            barGradient: "bg-gradient-to-r from-emerald-500 to-teal-400",
            accentBorder: "border-l-emerald-500",
        },
        expiring: {
            bannerBg: "bg-amber-50/90 border-amber-200/70 text-amber-800",
            dotColor: "bg-amber-500",
            title: "SẮP HẾT HẠN BẢO HÀNH",
            badgeBg: "bg-amber-600 text-white",
            badgeText: isDaysNumber
                ? `Còn ${daysLeft} ngày`
                : "Sắp hết hạn",
            barGradient: "bg-gradient-to-r from-amber-500 to-orange-400",
            accentBorder: "border-l-amber-500",
        },
        expired: {
            bannerBg: "bg-red-50/90 border-red-200/70 text-red-800",
            dotColor: "bg-red-500",
            title: "ĐÃ HẾT HẠN BẢO HÀNH",
            badgeBg: "bg-red-600 text-white",
            badgeText: "Đã hết hạn",
            barGradient: "bg-slate-400",
            accentBorder: "border-l-rose-500",
        },
        unlimited: {
            bannerBg: "bg-indigo-50/90 border-indigo-200/70 text-indigo-800",
            dotColor: "bg-indigo-500",
            title: "BẢO HÀNH LINH HOẠT",
            badgeBg: "bg-indigo-600 text-white",
            badgeText: "Không giới hạn",
            barGradient: "bg-gradient-to-r from-indigo-500 to-blue-500",
            accentBorder: "border-l-indigo-500",
        },
    };

    return statusMap[status] || statusMap.active;
}

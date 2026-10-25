"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Plus, Package, Settings } from "lucide-react";
import { useTicketModal } from "@/components/domain/ticket-modal";
import { useHaptic } from "@/hooks/use-haptic";
import { useUIStore } from "@/lib/store/ui-store";

export function BottomNav() {
    const pathname = usePathname();
    const { openTicketModal } = useTicketModal();
    const { trigger } = useHaptic();
    const isBottomNavHidden = useUIStore((state) => state.isBottomNavHidden);

    const navItems = [
        {
            label: "Tổng quan",
            href: "/admin",
            icon: LayoutDashboard,
            active: pathname === "/admin",
        },
        {
            label: "Hồ sơ xe",
            href: "/admin/xe",
            icon: Car,
            active: pathname.startsWith("/admin/xe"),
        },
        // Vị trí thứ 3 là FAB (+) Nổi bật ở giữa
        {
            label: "Tạo phiếu",
            isFab: true,
        },
        {
            label: "Kho hàng",
            href: "/admin/kho",
            icon: Package,
            active: pathname.startsWith("/admin/kho"),
        },
        {
            label: "Cài đặt",
            href: "/admin/cai-dat",
            icon: Settings,
            active: pathname === "/admin/cai-dat",
        },
    ];

    const handleFabClick = () => {
        trigger("tap");
        openTicketModal();
    };

    return (
        <nav
            aria-label="Điều hướng chính di động"
            className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl rounded-t-3xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out touch-manipulation ${
                isBottomNavHidden
                    ? "translate-y-full opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
            }`}
        >
            <div className="flex items-center justify-between relative max-w-md mx-auto px-2 pt-1 pb-1.5">
                {navItems.map((item) => {
                    if (item.isFab) {
                        return (
                            <div
                                key="fab"
                                className="relative -top-4 flex items-center justify-center flex-1 min-w-0"
                            >
                                <button
                                    type="button"
                                    onClick={handleFabClick}
                                    className="group relative w-12.5 h-12.5 rounded-full bg-linear-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-[0_8px_20px_-2px_rgba(37,99,235,0.45),0_3px_8px_-1px_rgba(37,99,235,0.3)] ring-[4px] ring-white/95 hover:shadow-[0_10px_24px_-2px_rgba(37,99,235,0.55)] active:scale-90 transition-all duration-200 cursor-pointer"
                                    aria-label="Tạo phiếu sửa chữa mới"
                                >
                                    <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Plus className="w-6 h-6 stroke-[2.6] transition-transform duration-200 group-active:rotate-90" />
                                </button>
                            </div>
                        );
                    }

                    const Icon = item.icon!;
                    const isActive = item.active;

                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            onClick={() => trigger("tap")}
                            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 group"
                        >
                            <div
                                className={`relative p-1 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? "bg-blue-50/90 text-blue-600 shadow-2xs"
                                        : "text-slate-400 group-hover:text-slate-600"
                                }`}
                            >
                                <Icon
                                    className={`w-5 h-5 transition-transform duration-200 ${
                                        isActive
                                            ? "stroke-[2.3] scale-105"
                                            : "stroke-[1.8]"
                                    }`}
                                />
                            </div>
                            <span
                                className={`text-[10px] tracking-tight mt-0.5 leading-tight transition-colors ${
                                    isActive
                                        ? "font-bold text-blue-600"
                                        : "font-medium text-slate-500"
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

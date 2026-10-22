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
        // Vị trí thứ 3 là FAB (+)
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
            className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-2xl border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out touch-manipulation ${
                isBottomNavHidden
                    ? "translate-y-full opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
            }`}
        >
            <div className="flex items-center justify-around h-16 px-1 relative max-w-lg mx-auto">
                {navItems.map((item) => {
                    if (item.isFab) {
                        return (
                            <div key="fab" className="relative -top-4 flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={handleFabClick}
                                    className="w-13 h-13 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 ring-4 ring-white active:scale-90 transition-all cursor-pointer"
                                    aria-label="Tạo phiếu bảo hành mới"
                                >
                                    <Plus className="w-6 h-6 stroke-[2.5]" />
                                </button>
                                <span className="text-[10px] font-bold text-blue-700 mt-0.5 tracking-tight">
                                    Tạo phiếu
                                </span>
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
                            className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all active:scale-95 ${
                                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700 font-medium"
                            }`}
                        >
                            <div className="relative">
                                <Icon
                                    className={`w-5 h-5 transition-transform ${isActive ? "stroke-[2.4] text-blue-600 scale-105" : "stroke-[1.8]"}`}
                                />
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                                )}
                            </div>
                            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

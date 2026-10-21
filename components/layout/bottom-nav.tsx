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
            className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-lg shadow-slate-900/5 pb-[max(0.25rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out ${
                isBottomNavHidden
                    ? "translate-y-full opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100"
            }`}
        >
            <div className="flex items-center justify-around h-14 px-1.5 relative max-w-lg mx-auto">
                {navItems.map((item) => {
                    if (item.isFab) {
                        return (
                            <div key="fab" className="relative -top-3.5 flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={handleFabClick}
                                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-white active:scale-90 transition-all cursor-pointer"
                                    aria-label="Tạo phiếu bảo hành mới"
                                >
                                    <Plus className="w-5 h-5 stroke-[2.5]" />
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
                            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700 font-medium"
                            }`}
                        >
                            <Icon
                                className={`w-4.5 h-4.5 ${isActive ? "stroke-[2.5] text-blue-600" : "stroke-[1.8]"}`}
                            />
                            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

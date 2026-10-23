"use client";

import React from "react";
import { VehicleOverview } from "@/types/garage";
import { LicensePlate } from "@/components/domain/license-plate";
import { CarColorPicker } from "@/components/domain/car-color-picker";
import { StatusBadge } from "@/components/domain/status-badge";
import { useHaptic } from "@/hooks/use-haptic";
import { Phone, Plus } from "lucide-react";

export interface VehicleHeroCardProps {
    vehicle: VehicleOverview;
    onCreateTicket: () => void;
}

export function VehicleHeroCard({ vehicle, onCreateTicket }: VehicleHeroCardProps) {
    const { trigger } = useHaptic();
    const carColor = vehicle.color?.trim() || "#3B82F6";

    return (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-[#181326] via-[#10121C] to-[#0A0C14] border border-slate-800/40 shadow-2xl p-5 sm:p-6 text-white space-y-4 sm:space-y-5">
            {/* 1. Dynamic Ambient Glow mượt mà, phản chiếu dịu nhẹ theo màu sơn */}
            <div
                className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-20 blur-3xl transition-colors duration-700"
                style={{ backgroundColor: carColor }}
                aria-hidden="true"
            />

            {/* 2. Header Card: Biển số xe, Thẻ màu sơn & Trạng thái bảo hành (mềm mại, không viền gắt) */}
            <div className="relative z-10 space-y-3">
                {/* HÀNG 1: Biển số, Bộ chọn màu xe & Trạng thái bảo hành */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <LicensePlate plate={vehicle.plate} color={vehicle.plateColor} size="md" />
                    <CarColorPicker vehicleId={vehicle.id} currentColor={vehicle.color} size="md" shape="rect" />
                    <StatusBadge
                        status={vehicle.status}
                        className="border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_16px_-3px_rgba(0,0,0,0.4)] rounded-xl"
                    />
                </div>

                {/* HÀNG 2: Tên xe nổi bật trên nền tối sâu */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                        {vehicle.model}
                    </h1>
                </div>
            </div>

            {/* 3. Khối Chủ xe & Số điện thoại: Không dùng border, tạo cảm giác nổi khối bằng ánh sáng và bóng đổ mượt mà */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-0.5">
                {/* Cột 1: Chủ sở hữu */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-linear-to-b from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_8px_20px_-4px_rgba(0,0,0,0.45)] backdrop-blur-xs flex flex-col justify-center transition-transform hover:-translate-y-0.5">
                    <span className="text-xs text-slate-400 font-medium block">Chủ sở hữu</span>
                    <span className="font-bold text-white text-base sm:text-lg tracking-tight leading-tight block mt-1 truncate">
                        {vehicle.ownerName || "Chưa có tên chủ xe"}
                    </span>
                </div>

                {/* Cột 2: Số điện thoại */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-linear-to-b from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_8px_20px_-4px_rgba(0,0,0,0.45)] backdrop-blur-xs flex items-center justify-between gap-3 transition-transform hover:-translate-y-0.5">
                    <div className="min-w-0 flex-1">
                        <span className="text-xs text-slate-400 font-medium block">Số điện thoại</span>
                        <span className="font-mono font-bold text-amber-400 text-base sm:text-lg tracking-wider leading-tight block mt-1 truncate">
                            {vehicle.ownerPhone || "—"}
                        </span>
                    </div>

                    {vehicle.ownerPhone && (
                        <a
                            href={`tel:${vehicle.ownerPhone}`}
                            onClick={() => trigger("tap")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 text-xs font-semibold shrink-0 transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-950/40"
                            title={`Gọi ${vehicle.ownerPhone}`}
                        >
                            <Phone className="w-3.5 h-3.5 fill-current" />
                            <span>Gọi</span>
                        </a>
                    )}
                </div>
            </div>

            {/* 4. Action Button: Tạo Phiếu Mới Cho Xe Này */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                    type="button"
                    onClick={onCreateTicket}
                    className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all cursor-pointer border-0"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Tạo Phiếu Bảo Hành Cho Xe Này</span>
                </button>
            </div>
        </div>
    );
}

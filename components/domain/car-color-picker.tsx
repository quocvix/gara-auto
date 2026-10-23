"use client";

import React, { useState } from "react";
import { getCarColorConfig } from "@/lib/car-colors";
import { useGarageStore } from "@/lib/store/garage-store";
import { useHaptic } from "@/hooks/use-haptic";
import { toast } from "sonner";
import { Pipette } from "lucide-react";
import { ColorPickerModal } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";

export interface CarColorPickerProps {
    vehicleId: string;
    currentColor?: string;
    size?: "sm" | "md";
    shape?: "square" | "rect";
    className?: string;
}

export function CarColorPicker({
    vehicleId,
    currentColor = "",
    size = "sm",
    shape = "rect",
    className = "",
}: CarColorPickerProps) {
    const { updateVehicleColor } = useGarageStore();
    const { trigger } = useHaptic();

    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Config của màu hiện tại đã lưu trong DB
    const savedConfig = getCarColorConfig(currentColor);

    const handleSaveColor = async (newHex: string) => {
        try {
            setIsSaving(true);
            trigger("tap");
            const res = await updateVehicleColor(vehicleId, newHex);
            if (res.ok) {
                const conf = getCarColorConfig(newHex);
                toast.success(conf ? `Đã lưu màu sơn: ${conf.name}` : "Đã cập nhật màu xe");
            } else {
                trigger("error");
                toast.error(res.error || "Không thể cập nhật màu xe");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearColor = async () => {
        try {
            setIsSaving(true);
            trigger("tap");
            const res = await updateVehicleColor(vehicleId, "");
            if (res.ok) {
                toast.success("Đã bỏ chọn màu xe");
            } else {
                trigger("error");
                toast.error(res.error || "Không thể xóa màu xe");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const badgeSizes = {
        sm: shape === "rect" ? "w-10 h-7 rounded-sm" : "w-10 h-7 rounded-md",
        md: shape === "rect" ? "w-13 h-8.5 rounded-lg" : "w-8 h-8 rounded-xl",
    };

    return (
        <div className={`relative inline-flex items-center ${className}`}>
            {/* BADGE MÀU TRÊN CARD XE: BẤM VÀO MỞ TRỰC TIẾP MODAL PHA MÀU */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    trigger("tap");
                    setIsOpen(true);
                }}
                className="p-1.5 -m-1.5 inline-flex items-center justify-center rounded-md transition-transform active:scale-90 cursor-pointer touch-manipulation"
                title={
                    savedConfig
                        ? `Màu xe: ${savedConfig.name} (Chạm để đổi màu)`
                        : "Chưa chọn màu xe (Chạm để chọn màu)"
                }
                aria-label={savedConfig ? `Màu xe ${savedConfig.name}` : "Chọn màu sơn xe"}
            >
                <span
                    className={cn(
                        "relative shrink-0 flex items-center justify-center transition-all select-none hover:scale-105 rounded-xl border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_6px_16px_-3px_rgba(0,0,0,0.4)]",
                        badgeSizes[size],
                        savedConfig
                            ? ""
                            : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white"
                    )}
                    style={
                        savedConfig
                            ? {
                                  backgroundColor: savedConfig.hex,
                                  boxShadow: savedConfig.border ? `inset 0 0 0 1px ${savedConfig.border}` : undefined,
                              }
                            : undefined
                    }
                >
                    {!savedConfig && <Pipette className="w-3 h-3" />}
                </span>
            </button>

            {/* MODAL PHA MÀU LÀM GỐC: KHÔNG CẦN QUA BƯỚC TRUNG GIAN */}
            <ColorPickerModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                color={savedConfig?.hex || currentColor || "#2563EB"}
                title="Đổi màu sơn xe"
                isSaving={isSaving}
                onChange={handleSaveColor}
                onClear={currentColor ? handleClearColor : undefined}
            />
        </div>
    );
}

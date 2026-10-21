"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { POPULAR_CAR_COLORS, getCarColorConfig } from "@/lib/car-colors";
import { useGarageStore } from "@/lib/store/garage-store";
import { useHaptic } from "@/hooks/use-haptic";
import { toast } from "sonner";
import { Pipette, Check, X, Trash2, Palette, Sparkles } from "lucide-react";

interface CarColorPickerProps {
    vehicleId: string;
    currentColor?: string;
    size?: "sm" | "md";
    className?: string;
}

export function CarColorPicker({
    vehicleId,
    currentColor = "",
    size = "sm",
    className = "",
}: CarColorPickerProps) {
    const { updateVehicleColor } = useGarageStore();
    const { trigger } = useHaptic();

    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [pendingColor, setPendingColor] = useState(currentColor || "");
    const [customHexInput, setCustomHexInput] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const desktopPopoverRef = useRef<HTMLDivElement>(null);
    const mobileSheetRef = useRef<HTMLDivElement>(null);
    const nativeColorInputRef = useRef<HTMLInputElement>(null);

    // Config của màu hiện tại đã lưu trong DB
    const savedConfig = getCarColorConfig(currentColor);
    // Config của màu đang được chọn thử (preview)
    const previewConfig = getCarColorConfig(pendingColor);

    // Đảm bảo client-side mounted cho createPortal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset pendingColor & hex input mỗi khi mở modal
    useEffect(() => {
        if (isOpen) {
            setPendingColor(currentColor || "");
            const currentCfg = getCarColorConfig(currentColor);
            setCustomHexInput(currentCfg?.hex || "");
        }
    }, [isOpen, currentColor]);

    // Khóa cuộn màn hình trên mobile khi mở Bottom Sheet & lắng nghe ESC / Click outside
    useEffect(() => {
        if (!isOpen) return;

        // Khóa cuộn trang khi mở modal trên mobile
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            // 1. Nếu click vào bên trong mobile bottom sheet (rendered qua Portal) -> KHÔNG ĐƯỢC ĐÓNG
            if (mobileSheetRef.current && mobileSheetRef.current.contains(target)) {
                return;
            }

            // 2. Nếu click vào badge nút bấm -> KHÔNG ĐƯỢC ĐÓNG (nút tự toggle)
            if (containerRef.current && containerRef.current.contains(target)) {
                return;
            }

            // 3. Nếu click vào bên trong desktop popover -> KHÔNG ĐƯỢC ĐÓNG
            if (desktopPopoverRef.current && desktopPopoverRef.current.contains(target)) {
                return;
            }

            // Click hoàn toàn bên ngoài các vùng trên -> Đóng modal (Hủy thay đổi chưa lưu)
            setIsOpen(false);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    // Chọn thử màu (chưa lưu)
    const handlePickPreview = (colorVal: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        trigger("tap");
        setPendingColor(colorVal);
        setCustomHexInput(colorVal);
    };

    // Khi người dùng chọn từ bảng màu hệ điều hành
    const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value.toUpperCase();
        setPendingColor(hex);
        setCustomHexInput(hex);
    };

    // Lưu thực sự khi người dùng nhấn ÁP DỤNG
    const handleApplySave = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isSaving) return;

        // Chuẩn hóa màu trước khi lưu (nếu người dùng đang gõ dở mã HEX)
        let finalColor = pendingColor.trim();
        if (customHexInput.trim()) {
            let hex = customHexInput.trim();
            if (!hex.startsWith("#")) hex = `#${hex}`;
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
                finalColor = hex.toUpperCase();
            }
        }

        try {
            setIsSaving(true);
            trigger("tap");
            const res = await updateVehicleColor(vehicleId, finalColor);
            if (res.ok) {
                const conf = getCarColorConfig(finalColor);
                toast.success(conf ? `Đã lưu màu sơn: ${conf.name}` : "Đã xóa màu xe");
                setIsOpen(false);
            } else {
                trigger("error");
                toast.error(res.error || "Không thể cập nhật màu xe");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const badgeSizes = {
        sm: "w-6 h-6 rounded-lg",
        md: "w-8 h-8 rounded-xl",
    };

    return (
        <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
            {/* BADGE MÀU DUY NHẤT TRÊN CARD XE */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    trigger("tap");
                    setIsOpen((prev) => !prev);
                }}
                className="p-1.5 -m-1.5 inline-flex items-center justify-center rounded-xl transition-transform active:scale-90 cursor-pointer touch-manipulation"
                title={savedConfig ? `Màu xe: ${savedConfig.name} (Chạm để đổi)` : "Chưa chọn màu xe (Chạm để chọn)"}
                aria-label={savedConfig ? `Màu xe ${savedConfig.name}` : "Chọn màu sơn xe"}
            >
                <span
                    className={`relative shrink-0 flex items-center justify-center transition-all select-none shadow-xs hover:scale-105 ${badgeSizes[size]} ${
                        savedConfig
                            ? "border border-black/15 shadow-sm"
                            : "bg-slate-100/90 hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-400 text-slate-400 hover:text-blue-600"
                    }`}
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

            {/* Input color native ẩn để kích hoạt bảng pha màu của OS */}
            <input
                ref={nativeColorInputRef}
                type="color"
                value={previewConfig?.hex || "#2563EB"}
                onChange={handleNativeColorChange}
                className="sr-only"
                aria-label="Chọn mã màu xe tùy chỉnh từ hệ điều hành"
            />

            {/* ========================================================================= */}
            {/* 1. MOBILE VIEW: RENDER QUA REACT PORTAL ĐẾN DOCUMENT.BODY (CHỐNG TRÀN UI) */}
            {/* ========================================================================= */}
            {mounted &&
                isOpen &&
                createPortal(
                    <div
                        className="sm:hidden fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                e.stopPropagation();
                                setIsOpen(false);
                            }
                        }}
                    >
                        <div
                            ref={mobileSheetRef}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-white rounded-t-3xl border-t border-slate-200/80 shadow-2xl p-5 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-250 text-slate-900 overflow-hidden"
                        >
                            {/* Thanh kéo drag handle */}
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

                            {/* Header Sheet: Preview màu đang chọn thử */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border shadow-xs transition-all"
                                        style={{
                                            backgroundColor: previewConfig?.hex || "#F1F5F9",
                                            borderColor: previewConfig?.border || "rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        {!previewConfig ? (
                                            <Palette className="w-4 h-4 text-slate-500" />
                                        ) : (
                                            <Check
                                                className="w-4 h-4 stroke-[3]"
                                                style={{ color: previewConfig.textColor || "#FFFFFF" }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                                            <span>{previewConfig ? previewConfig.name : "Chưa chọn màu"}</span>
                                            {pendingColor !== currentColor && (
                                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200">
                                                    Chưa lưu
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono">
                                            {previewConfig ? previewConfig.hex : "Chạm để chọn màu bên dưới"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    }}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors"
                                    aria-label="Đóng"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Lưới 10 ô màu xe: Touch target 48x48px rộng rãi chuẩn ngón tay */}
                            <div>
                                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    <span>Màu xe phổ biến</span>
                                    {pendingColor && (
                                        <button
                                            type="button"
                                            onClick={(e) => handlePickPreview("", e)}
                                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 active:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Bỏ chọn màu</span>
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-5 gap-3 justify-items-center">
                                    {POPULAR_CAR_COLORS.map((color) => {
                                        const isSelected =
                                            pendingColor.trim().toLowerCase() === color.hex.toLowerCase() ||
                                            pendingColor.trim().toLowerCase() === color.name.toLowerCase();

                                        return (
                                            <button
                                                key={color.name}
                                                type="button"
                                                onClick={(e) => handlePickPreview(color.hex, e)}
                                                className="w-full flex flex-col items-center gap-1.5 group cursor-pointer active:scale-90 transition-transform touch-manipulation"
                                            >
                                                <div
                                                    className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-all shadow-sm ${
                                                        isSelected
                                                            ? "ring-3 ring-blue-600 ring-offset-2 scale-105"
                                                            : "hover:scale-105 active:scale-95"
                                                    }`}
                                                    style={{
                                                        backgroundColor: color.hex,
                                                        border: color.border
                                                            ? `1.5px solid ${color.border}`
                                                            : "1px solid rgba(0,0,0,0.12)",
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <Check
                                                            className="w-5 h-5 stroke-[3]"
                                                            style={{ color: color.textColor || "#FFFFFF" }}
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-700 truncate max-w-full text-center">
                                                    {color.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Khu vực Nhập mã HEX & Native Color Picker */}
                            <div className="pt-3 border-t border-slate-100 space-y-2.5">
                                <div className="flex items-center gap-2">
                                    {/* Nút Pipette kích hoạt native OS color picker */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nativeColorInputRef.current?.click();
                                        }}
                                        className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                                        title="Mở bộ pha màu của điện thoại"
                                    >
                                        <Pipette className="w-4 h-4 text-blue-600" />
                                        <span>Bảng màu OS</span>
                                    </button>

                                    {/* Input nhập mã HEX */}
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={customHexInput}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCustomHexInput(val);
                                                let hex = val.trim();
                                                if (!hex.startsWith("#")) hex = `#${hex}`;
                                                if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
                                                    setPendingColor(hex.toUpperCase());
                                                }
                                            }}
                                            placeholder="#RRGGBB"
                                            maxLength={7}
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 font-mono text-xs uppercase text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                        />
                                    </div>
                                </div>

                                {/* HÀNG NÚT HÀNH ĐỘNG: CHỈ LƯU KHI BẤM ÁP DỤNG */}
                                <div className="pt-2 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                        }}
                                        disabled={isSaving}
                                        className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        Hủy bỏ
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleApplySave}
                                        disabled={isSaving}
                                        className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
                                    >
                                        <Check className="w-4 h-4 stroke-[2.5]" />
                                        <span>{isSaving ? "Đang lưu..." : "Áp dụng"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {/* ========================================================================= */}
            {/* 2. DESKTOP VIEW (>= sm): POPOVER NHỎ GỌN NỔI DƯỚI BADGE */}
            {/* ========================================================================= */}
            {isOpen && (
                <div
                    ref={desktopPopoverRef}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:block absolute left-0 top-full mt-2 z-50 w-56 p-3 bg-white border border-slate-200/90 rounded-2xl shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
                >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-4 h-4 rounded-md border inline-block shadow-2xs"
                                style={{
                                    backgroundColor: previewConfig?.hex || "#F1F5F9",
                                    borderColor: previewConfig?.border || "rgba(0,0,0,0.15)",
                                }}
                            />
                            <span className="text-xs font-bold text-slate-800 truncate max-w-28">
                                {previewConfig ? previewConfig.name : "Chưa chọn"}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Lưới 10 swatches */}
                    <div className="grid grid-cols-5 gap-2 justify-items-center">
                        {POPULAR_CAR_COLORS.map((color) => {
                            const isSelected =
                                pendingColor.trim().toLowerCase() === color.hex.toLowerCase() ||
                                pendingColor.trim().toLowerCase() === color.name.toLowerCase();

                            return (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={(e) => handlePickPreview(color.hex, e)}
                                    title={color.name}
                                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer relative shadow-2xs ${
                                        isSelected ? "ring-2 ring-blue-600 ring-offset-1" : ""
                                    }`}
                                    style={{
                                        backgroundColor: color.hex,
                                        border: color.border
                                            ? `1px solid ${color.border}`
                                            : "1px solid rgba(0,0,0,0.15)",
                                    }}
                                >
                                    {isSelected && (
                                        <Check
                                            className="w-3.5 h-3.5 stroke-[3]"
                                            style={{ color: color.textColor || "#FFFFFF" }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Nút Bảng màu OS & Xóa màu */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                nativeColorInputRef.current?.click();
                            }}
                            className="flex-1 h-7 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-2xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Mở bảng pha màu chi tiết hoặc nhập mã HEX"
                        >
                            <Pipette className="w-3 h-3 text-blue-600" />
                            <span>Màu khác...</span>
                        </button>

                        {pendingColor && (
                            <button
                                type="button"
                                onClick={(e) => handlePickPreview("", e)}
                                className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Bỏ chọn màu xe"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* NÚT ÁP DỤNG TRÊN DESKTOP */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            disabled={isSaving}
                            className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={handleApplySave}
                            disabled={isSaving}
                            className="flex-1 h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                        >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>{isSaving ? "Đang lưu..." : "Áp dụng"}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


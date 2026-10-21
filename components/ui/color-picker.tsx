"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { X, Check, Pipette, RefreshCw, Sparkles, Trash2, Loader2 } from "lucide-react";
import { POPULAR_CAR_COLORS, getCarColorConfig } from "@/lib/car-colors";

export interface ColorPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    color: string;
    onChange: (hexColor: string) => void | Promise<void>;
    onClear?: () => void | Promise<void>;
    title?: string;
    isSaving?: boolean;
}

export function ColorPickerModal({
    isOpen,
    onClose,
    color,
    onChange,
    onClear,
    title = "Pha màu xe tùy chỉnh",
    isSaving = false,
}: ColorPickerModalProps) {
    const [mounted, setMounted] = React.useState(false);

    // Normalize initial color to valid hex
    const formatHex = (val: string) => {
        if (!val) return "#2563EB";
        let c = val.trim();
        if (!c.startsWith("#")) c = `#${c}`;
        return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c) ? c.toUpperCase() : "#2563EB";
    };

    const initialColor = React.useMemo(() => formatHex(color), [color]);
    const [stagedColor, setStagedColor] = React.useState<string>(initialColor);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            setStagedColor(initialColor);
        }
    }, [isOpen, initialColor]);

    // Close on Escape
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSaving) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isSaving, onClose]);

    // Prevent body scroll when open
    React.useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    const handleConfirm = async () => {
        if (isSaving) return;
        await onChange(stagedColor.toUpperCase());
        onClose();
    };

    const handleClear = async () => {
        if (isSaving || !onClear) return;
        await onClear();
        onClose();
    };

    const activeConfig = React.useMemo(() => getCarColorConfig(stagedColor), [stagedColor]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => !isSaving && onClose()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-250 select-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Handle */}
                <div className="sm:hidden pt-3 pb-1 flex justify-center">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Pipette className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight">{title}</h3>
                            <p className="text-[11px] text-slate-500">Chạm hoặc kéo để chọn màu sơn chính xác</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Đóng"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 overflow-y-auto">
                    {/* Color Preview Comparison Card */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div
                                    className="w-12 h-12 rounded-xl border border-black/15 shadow-sm transition-transform duration-150 flex items-center justify-center"
                                    style={{
                                        backgroundColor: stagedColor,
                                        boxShadow: activeConfig?.border ? `inset 0 0 0 1px ${activeConfig.border}` : undefined,
                                    }}
                                >
                                    <Sparkles className="w-4 h-4" style={{ color: activeConfig?.textColor || "#FFFFFF" }} />
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-500">Màu đang chọn:</div>
                                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <span>{activeConfig?.name || "Màu tùy chỉnh"}</span>
                                    {stagedColor.toUpperCase() !== initialColor.toUpperCase() && (
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                            Mới
                                        </span>
                                    )}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">{stagedColor.toUpperCase()}</div>
                            </div>
                        </div>

                        {/* Reset to initial button */}
                        {stagedColor.toUpperCase() !== initialColor.toUpperCase() && (
                            <button
                                type="button"
                                onClick={() => setStagedColor(initialColor)}
                                disabled={isSaving}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 active:bg-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Khôi phục màu ban đầu"
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>Khôi phục</span>
                            </button>
                        )}
                    </div>

                    {/* React Colorful Component Area */}
                    <div className="custom-colorful-wrapper flex flex-col items-center">
                        <style jsx global>{`
                            .custom-colorful-wrapper .react-colorful {
                                width: 100% !important;
                                height: 180px !important;
                                border-radius: 16px;
                            }
                            .custom-colorful-wrapper .react-colorful__saturation {
                                border-radius: 16px 16px 0 0;
                            }
                            .custom-colorful-wrapper .react-colorful__last-control {
                                border-radius: 0 0 16px 16px;
                                height: 26px;
                                margin-top: 8px;
                            }
                            .custom-colorful-wrapper .react-colorful__pointer {
                                width: 26px;
                                height: 26px;
                                border: 3px solid #ffffff;
                                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                            }
                        `}</style>
                        <HexColorPicker color={stagedColor} onChange={setStagedColor} />
                    </div>

                    {/* HEX Input Field with copy/paste */}
                    <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-slate-500 tracking-wider">HEX:</div>
                        <div className="flex-1 relative flex items-center">
                            <span className="absolute left-3 text-sm font-mono font-bold text-slate-400 select-none">
                                #
                            </span>
                            <HexColorInput
                                color={stagedColor}
                                onChange={setStagedColor}
                                disabled={isSaving}
                                className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 font-mono text-xs uppercase font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                            />
                        </div>
                    </div>

                    {/* Quick Selection Swatches from Popular Colors */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Gợi ý màu nhanh
                            </span>
                            {onClear && color && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={isSaving}
                                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 active:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Bỏ chọn màu xe</span>
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {POPULAR_CAR_COLORS.slice(0, 10).map((c) => {
                                const isCurrent = stagedColor.toUpperCase() === c.hex.toUpperCase();
                                return (
                                    <button
                                        key={c.name}
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() => setStagedColor(c.hex)}
                                        className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                                            isCurrent ? "ring-2 ring-blue-600 ring-offset-2 scale-105" : "hover:scale-105 active:scale-95"
                                        }`}
                                        style={{
                                            backgroundColor: c.hex,
                                            border: c.border ? `1px solid ${c.border}` : "1px solid rgba(0,0,0,0.1)",
                                        }}
                                        title={c.name}
                                    >
                                        {isCurrent && (
                                            <Check className="w-4 h-4 stroke-[3]" style={{ color: c.textColor }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 active:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isSaving}
                        className="flex-[1.5] h-10 px-5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 stroke-[2.5]" />
                                <span>Xác nhận màu</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

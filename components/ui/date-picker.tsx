"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
    isValid,
    subDays,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from "lucide-react";

export interface DatePickerProps {
    value?: string; // Format: 'YYYY-MM-DD'
    onChange: (dateStr: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    size?: "sm" | "md";
    id?: string;
    ariaLabel?: string;
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Chọn ngày",
    disabled = false,
    className = "",
    size = "md",
    id,
    ariaLabel = "Chọn ngày",
}: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    // Parse the initial value safely or fallback to now
    const selectedDate = React.useMemo(() => {
        if (!value) return null;
        try {
            const parsed = parseISO(value);
            return isValid(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }, [value]);

    // Internal staged date while picker is open
    const [stagedDate, setStagedDate] = React.useState<Date>(() => selectedDate || new Date());
    // Current viewed month in calendar
    const [viewMonth, setViewMonth] = React.useState<Date>(() => selectedDate || new Date());

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // When modal opens, sync staged date with selected date
    const handleOpen = () => {
        if (disabled) return;
        const initial = selectedDate || new Date();
        setStagedDate(initial);
        setViewMonth(initial);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleConfirm = () => {
        onChange(format(stagedDate, "yyyy-MM-dd"));
        setIsOpen(false);
    };

    const handleSelectToday = () => {
        const today = new Date();
        setStagedDate(today);
        setViewMonth(today);
    };

    const handleSelectYesterday = () => {
        const yesterday = subDays(new Date(), 1);
        setStagedDate(yesterday);
        setViewMonth(yesterday);
    };

    // Close on Escape key
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Prevent body scroll when open on mobile
    React.useEffect(() => {
        if (!isOpen) return;
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen]);

    // Calendar calculations
    const days = React.useMemo(() => {
        const monthStart = startOfMonth(viewMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [viewMonth]);

    const formattedDisplay = selectedDate ? format(selectedDate, "dd/MM/yyyy") : "";

    const sizeClasses =
        size === "sm"
            ? "h-7 px-2 text-[11px] gap-1.5"
            : "h-10 px-3 text-xs sm:text-sm gap-2";

    const modalContent = isOpen && mounted ? (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label="Bảng chọn ngày"
        >
            <div
                className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Handle */}
                <div className="sm:hidden pt-3 pb-1 flex justify-center">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                            Chọn ngày
                        </span>
                        <div className="text-base font-bold text-slate-900 capitalize">
                            {format(viewMonth, "MMMM yyyy", { locale: vi })}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setViewMonth((m) => subMonths(m, 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            aria-label="Tháng trước"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMonth((m) => addMonths(m, 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            aria-label="Tháng kế tiếp"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-9 h-9 sm:flex hidden items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ml-1"
                            aria-label="Đóng"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="px-5 pt-3 pb-1 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSelectToday}
                        className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                            isToday(stagedDate)
                                ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                        }`}
                    >
                        Hôm nay
                    </button>
                    <button
                        type="button"
                        onClick={handleSelectYesterday}
                        className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                            isSameDay(stagedDate, subDays(new Date(), 1))
                                ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                        }`}
                    >
                        Hôm qua
                    </button>
                </div>

                {/* Day of Week Headers */}
                <div className="px-5 pt-2 grid grid-cols-7 text-center">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName, idx) => (
                        <div
                            key={dayName}
                            className={`text-[11px] font-semibold py-1 ${
                                idx >= 5 ? "text-amber-600" : "text-slate-400"
                            }`}
                        >
                            {dayName}
                        </div>
                    ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="px-5 py-2 grid grid-cols-7 gap-1">
                    {days.map((day) => {
                        const isCurrentMonth = isSameMonth(day, viewMonth);
                        const isSelected = isSameDay(day, stagedDate);
                        const isCurrentDay = isToday(day);

                        return (
                            <button
                                key={day.toISOString()}
                                type="button"
                                onClick={() => setStagedDate(day)}
                                className={`h-10 sm:h-9 w-full flex flex-col items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer select-none relative ${
                                    isSelected
                                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 scale-[1.04]"
                                        : !isCurrentMonth
                                        ? "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
                                        : isCurrentDay
                                        ? "text-blue-600 font-bold bg-blue-50/80 hover:bg-blue-100/80"
                                        : "text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                <span>{format(day, "d")}</span>
                                {isCurrentDay && !isSelected && (
                                    <span className="w-1 h-1 rounded-full bg-blue-600 absolute bottom-1" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer with Confirmation */}
                <div className="p-4 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs">
                        <span className="text-slate-400 block text-[11px]">Ngày được chọn:</span>
                        <span className="font-semibold text-slate-800">
                            {format(stagedDate, "dd/MM/yyyy")}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 active:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="relative inline-block w-full">
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={handleOpen}
                aria-label={ariaLabel}
                className={`w-full rounded-lg border border-slate-200 bg-white font-mono text-slate-800 flex items-center justify-between hover:border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs transition-colors cursor-pointer ${sizeClasses} ${
                    disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""
                } ${className}`}
            >
                <span className={formattedDisplay ? "text-slate-800 font-medium" : "text-slate-400"}>
                    {formattedDisplay || placeholder}
                </span>
                <CalendarIcon
                    className={`text-slate-400 shrink-0 ${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}`}
                />
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
}

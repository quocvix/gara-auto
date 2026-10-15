"use client";

import React, {
    createContext,
    use,
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
    ReactNode,
} from "react";
import {
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    X,
    Loader2,
} from "lucide-react";
import { useHaptic } from "@/hooks/use-haptic";
import { useUIStore } from "@/lib/store/ui-store";

export type AlertDialogVariant = "danger" | "warning" | "info" | "success";

export interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void | Promise<void>;
    title: string;
    description?: ReactNode;
    variant?: AlertDialogVariant;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    isLoading?: boolean;
    closeOnBackdrop?: boolean;
    icon?: ReactNode;
}

const VARIANT_CONFIGS = {
    danger: {
        badgeClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/60",
        confirmButtonClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 focus:ring-rose-500",
        defaultIcon: AlertTriangle,
        haptic: "error" as const,
        defaultConfirmText: "Xác nhận xóa",
    },
    warning: {
        badgeClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/60",
        confirmButtonClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25 focus:ring-amber-500",
        defaultIcon: AlertCircle,
        haptic: "warning" as const,
        defaultConfirmText: "Tiếp tục",
    },
    info: {
        badgeClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/60",
        confirmButtonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 focus:ring-blue-500",
        defaultIcon: Info,
        haptic: "tap" as const,
        defaultConfirmText: "Đồng ý",
    },
    success: {
        badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/60",
        confirmButtonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 focus:ring-emerald-500",
        defaultIcon: CheckCircle2,
        haptic: "success" as const,
        defaultConfirmText: "Hoàn tất",
    },
};

/**
 * Reusable AlertDialog Component
 * Đồng bộ với Design System của Duy Auto:
 * - Bo góc 2xl / xl chuẩn tỉ lệ
 * - Shadow & subtle border chống lóa
 * - Haptic feedback tương thích di động
 * - Hỗ trợ cả 4 sắc thái: danger, warning, info, success
 */
export function AlertDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    variant = "danger",
    confirmText,
    cancelText = "Hủy bỏ",
    showCancel = true,
    isLoading = false,
    closeOnBackdrop = true,
    icon,
}: AlertDialogProps) {
    const { trigger } = useHaptic();
    const hideBottomNav = useUIStore((state) => state.hideBottomNav);
    const showBottomNav = useUIStore((state) => state.showBottomNav);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.danger;
    const IconComponent = config.defaultIcon;
    const finalConfirmText = confirmText || config.defaultConfirmText;

    // Body scroll locking and bottom nav hiding
    useEffect(() => {
        if (!isOpen) return;

        trigger(config.haptic);
        hideBottomNav();
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Auto focus: focus cancel button for destructive actions to prevent accidental submit
        const timer = setTimeout(() => {
            if (variant === "danger" && showCancel && cancelButtonRef.current) {
                cancelButtonRef.current.focus();
            } else if (confirmButtonRef.current) {
                confirmButtonRef.current.focus();
            }
        }, 50);

        return () => {
            clearTimeout(timer);
            showBottomNav();
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, variant, showCancel, config.haptic, hideBottomNav, showBottomNav, trigger]);

    // Keyboard ESC listener
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isLoading) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && closeOnBackdrop && !isLoading) {
            trigger("tap");
            onClose();
        }
    };

    const handleCancelClick = () => {
        if (isLoading) return;
        trigger("tap");
        onClose();
    };

    const handleConfirmClick = async () => {
        if (isLoading) return;
        trigger("tap");
        if (onConfirm) {
            await onConfirm();
        } else {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={handleBackdropClick}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            aria-describedby={description ? "alert-dialog-desc" : undefined}
        >
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
                {/* Header Icon + Close */}
                <div className="p-5 sm:p-6 pb-2 sm:pb-3 flex items-start gap-4">
                    <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${config.badgeClass}`}
                    >
                        {icon ? icon : <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                        <h3
                            id="alert-dialog-title"
                            className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug"
                        >
                            {title}
                        </h3>
                        {description && (
                            <div
                                id="alert-dialog-desc"
                                className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal"
                            >
                                {description}
                            </div>
                        )}
                    </div>

                    {closeOnBackdrop && !isLoading && (
                        <button
                            type="button"
                            onClick={handleCancelClick}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="Đóng"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="px-5 sm:px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
                    {showCancel && (
                        <button
                            ref={cancelButtonRef}
                            type="button"
                            onClick={handleCancelClick}
                            disabled={isLoading}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        ref={confirmButtonRef}
                        type="button"
                        onClick={handleConfirmClick}
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 ${config.confirmButtonClass}`}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{finalConfirmText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// IMPERATIVE CONTEXT & HOOK FOR SEAMLESS WINDOW.CONFIRM / ALERT REPLACEMENT
// -------------------------------------------------------------

export interface ConfirmOptions {
    title: string;
    description?: ReactNode;
    variant?: AlertDialogVariant;
    confirmText?: string;
    cancelText?: string;
    icon?: ReactNode;
    closeOnBackdrop?: boolean;
}

export interface AlertOptions {
    title: string;
    description?: ReactNode;
    variant?: AlertDialogVariant;
    confirmText?: string;
    icon?: ReactNode;
    closeOnBackdrop?: boolean;
}

interface AlertDialogContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    alert: (options: AlertOptions) => Promise<void>;
    close: () => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

export function useAlertDialog() {
    const context = use(AlertDialogContext);
    if (!context) {
        throw new Error("useAlertDialog must be used within an AlertDialogProvider");
    }
    return context;
}

/**
 * Provider cấp cao gắn ở AdaptiveShell hoặc App Layout
 * Cho phép gọi `const ok = await confirm({ ... })` hoặc `await alert({ ... })`
 * thay thế hoàn toàn `window.confirm` và `window.alert`
 */
export function AlertDialogProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<{
        isOpen: boolean;
        title: string;
        description?: ReactNode;
        variant: AlertDialogVariant;
        confirmText?: string;
        cancelText?: string;
        showCancel: boolean;
        icon?: ReactNode;
        closeOnBackdrop: boolean;
        isLoading: boolean;
    }>({
        isOpen: false,
        title: "",
        variant: "danger",
        showCancel: true,
        closeOnBackdrop: true,
        isLoading: false,
    });

    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const close = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }
    }, []);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setState({
                isOpen: true,
                title: options.title,
                description: options.description,
                variant: options.variant || "danger",
                confirmText: options.confirmText,
                cancelText: options.cancelText || "Hủy bỏ",
                showCancel: true,
                icon: options.icon,
                closeOnBackdrop: options.closeOnBackdrop ?? true,
                isLoading: false,
            });
        });
    }, []);

    const alert = useCallback((options: AlertOptions): Promise<void> => {
        return new Promise((resolve) => {
            resolveRef.current = () => resolve();
            setState({
                isOpen: true,
                title: options.title,
                description: options.description,
                variant: options.variant || "info",
                confirmText: options.confirmText || "Đã hiểu",
                cancelText: "",
                showCancel: false,
                icon: options.icon,
                closeOnBackdrop: options.closeOnBackdrop ?? true,
                isLoading: false,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
    }, []);

    const handleClose = useCallback(() => {
        close();
    }, [close]);

    const contextValue = useMemo(
        () => ({ confirm, alert, close }),
        [confirm, alert, close]
    );

    return (
        <AlertDialogContext.Provider value={contextValue}>
            {children}
            <AlertDialog
                isOpen={state.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={state.title}
                description={state.description}
                variant={state.variant}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                showCancel={state.showCancel}
                isLoading={state.isLoading}
                closeOnBackdrop={state.closeOnBackdrop}
                icon={state.icon}
            />
        </AlertDialogContext.Provider>
    );
}

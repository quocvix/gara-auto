import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export interface EmptyStateProps {
    message: string;
    onClear?: () => void;
    clearLabel?: string;
    className?: string;
}

/**
 * EmptyState — Trạng thái rỗng chuẩn theo quy ước UI/UX Skill (references/components/empty-state.md)
 * - Tối giản: đúng 1 dòng text-sm text-slate-500, không hình vẽ to đùng hay phóng đại
 * - Rỗng do lọc/tìm kiếm: có link chữ rõ ràng ngay sau câu để hoàn tác/nới lọc
 */
export function EmptyState({
    message,
    onClear,
    clearLabel = "Xóa tìm kiếm",
    className,
}: EmptyStateProps) {
    return (
        <div className={cn("py-8 text-center text-sm text-slate-500 dark:text-slate-400", className)}>
            <p className="inline">
                {message}{" "}
                {onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                    >
                        {clearLabel}
                    </button>
                )}
            </p>
        </div>
    );
}

export interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    retryLabel?: string;
    className?: string;
}

/**
 * ErrorState — Lỗi tải chuẩn 2 tầng (references/components/empty-state.md#lỗi-tải)
 * - Tầng 1: Tiêu đề lỗi rõ ràng text-rose-600
 * - Tầng 2: Nguyên nhân text-slate-500
 * - Nút Thử lại dạng outline kèm icon RotateCw
 */
export function ErrorState({
    title = "Không thể tải dữ liệu",
    description,
    onRetry,
    retryLabel = "Thử lại",
    className,
}: ErrorStateProps) {
    return (
        <div role="alert" className={cn("flex flex-col items-center gap-3 py-8 text-center", className)}>
            <div>
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{title}</p>
                {description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{retryLabel}</span>
                </Button>
            )}
        </div>
    );
}

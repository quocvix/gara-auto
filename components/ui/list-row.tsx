import React from "react";
import { cn } from "@/lib/utils";

export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLLIElement>, "title"> {
    leftIcon?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    badge?: React.ReactNode;
    rightAction?: React.ReactNode;
    hoverable?: boolean;
    ref?: React.Ref<HTMLLIElement>;
}

/**
 * ListRow — Chuẩn dòng danh sách theo quy ước UI/UX Skill (references/components/list-row.md)
 * - 3 tầng thị giác: Hành động/Icon chính bên trái, nội dung co giãn min-w-0 ở giữa, hành động phụ bên phải
 * - Tương tác hover nền chìm mượt mà, hỗ trợ touch devices qua @media(hover:none)
 */
export function ListRow({
    className,
    leftIcon,
    title,
    subtitle,
    badge,
    rightAction,
    hoverable = true,
    ref,
    ...props
}: ListRowProps) {
    return (
        <li
            ref={ref}
            className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                hoverable && "hover:bg-slate-100/70 dark:hover:bg-slate-800/60",
                className
            )}
            {...props}
        >
            {leftIcon && <div className="shrink-0">{leftIcon}</div>}

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </div>
                    {badge && <div className="shrink-0">{badge}</div>}
                </div>
                {subtitle && (
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                        {subtitle}
                    </div>
                )}
            </div>

            {rightAction && (
                <div className="shrink-0 flex items-center gap-1">
                    {rightAction}
                </div>
            )}
        </li>
    );
}

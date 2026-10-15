import React from "react";
import { cn, focusRing } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
    ref?: React.Ref<HTMLInputElement>;
}

// React 19: ref is a regular prop
export function Input({
    className,
    containerClassName,
    type = "text",
    error,
    leftIcon,
    rightIcon,
    ref,
    ...props
}: InputProps) {
    return (
        <div className={cn("relative w-full", containerClassName)}>
            {leftIcon && (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                    {leftIcon}
                </div>
            )}
            <input
                type={type}
                className={cn(
                    "flex h-11 sm:h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all",
                    focusRing,
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    leftIcon && "pl-10",
                    rightIcon && "pr-10",
                    error && "border-rose-500 dark:border-rose-500 focus-visible:ring-rose-500",
                    className
                )}
                ref={ref}
                aria-invalid={!!error}
                aria-describedby={error && props.id ? `${props.id}-error` : undefined}
                {...props}
            />
            {rightIcon && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    {rightIcon}
                </div>
            )}
            {error && (
                <p
                    id={props.id ? `${props.id}-error` : undefined}
                    className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

import React from "react";
import { cn } from "@/lib/utils";

// React 19: ref is a regular prop, no forwardRef needed
export function Card({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
    return (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs overflow-hidden",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
    return (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 p-4 sm:p-5", className)}
            {...props}
        />
    );
}

export function CardTitle({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) {
    return (
        <h3
            ref={ref}
            className={cn(
                "text-base sm:text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100",
                className
            )}
            {...props}
        />
    );
}

export function CardDescription({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) {
    return (
        <p
            ref={ref}
            className={cn("text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed", className)}
            {...props}
        />
    );
}

export function CardContent({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
    return <div ref={ref} className={cn("p-4 sm:p-5 pt-0", className)} {...props} />;
}

export function CardFooter({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
    return (
        <div
            ref={ref}
            className={cn(
                "flex items-center p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4",
                className
            )}
            {...props}
        />
    );
}

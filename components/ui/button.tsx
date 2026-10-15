"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRing, disabled } from "@/lib/utils";

export const buttonVariants = cva(
    cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer",
        focusRing,
        disabled
    ),
    {
        variants: {
            variant: {
                default:
                    "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25",
                destructive:
                    "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25",
                outline:
                    "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs",
                secondary:
                    "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200",
                ghost:
                    "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
                link:
                    "text-blue-600 underline-offset-4 hover:underline p-0 h-auto font-semibold",
                amber:
                    "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25",
                emerald:
                    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8.5 rounded-lg px-3 text-xs",
                lg: "h-11 rounded-xl px-6 text-sm",
                icon: "h-10 w-10 p-0 shrink-0",
                iconSm: "h-8.5 w-8.5 p-0 shrink-0 rounded-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    ref?: React.Ref<HTMLButtonElement>;
}

// React 19: ref is a standard prop, no forwardRef needed
export function Button({
    className,
    variant,
    size,
    ref,
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            ref={ref}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

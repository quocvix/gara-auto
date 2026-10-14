"use client";

import React, { useState } from "react";
import { useGarageStore } from "@/lib/store/garage-store";
import { Part } from "@/types/garage";
import { X, Wrench, Save, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";

interface PartModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPart?: Part | null;
    onCreatedSuccess?: (newPartId: string) => void;
}

export function PartModal({
    isOpen,
    onClose,
    initialPart,
    onCreatedSuccess,
}: PartModalProps) {
    const { savePart } = useGarageStore();
    const { trigger } = useHaptic();

    const [name, setName] = useState(initialPart?.name || "");
    const [stock, setStock] = useState(initialPart?.stock || 5);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync khi initialPart thay đổi
    React.useEffect(() => {
        if (initialPart) {
            setName(initialPart.name);
            setStock(initialPart.stock);
        } else {
            setName("");
            setStock(5);
        }
        setError("");
    }, [initialPart, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setError("");

        if (!name.trim()) {
            setError("Vui lòng nhập tên phụ tùng");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await savePart({
                id: initialPart?.id,
                name: name.trim(),
                category: initialPart?.category || "Phụ tùng",
                warrantyMonths: initialPart?.warrantyMonths || 0,
                price: initialPart?.price || 0,
                stock: Math.max(0, Number(stock) || 0),
                isActive: true,
            });

            if (!res.ok) {
                setError(res.error || "Có lỗi xảy ra");
                trigger("error");
                return;
            }

            trigger("success");
            toast.success(initialPart ? "Cập nhật phụ tùng thành công!" : "Đã thêm phụ tùng mới vào kho!");
            onCreatedSuccess?.(res.part?.id || "");
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="force-light w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900 leading-tight">
                                {initialPart ? "Chỉnh Sửa Phụ Tùng" : "Thêm Phụ Tùng Vào Kho"}
                            </h3>
                            <p className="text-xs text-slate-500">Chỉnh sửa tên và cập nhật số lượng tồn kho</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && (
                        <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Tên Phụ Tùng *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Dầu nhớt Motul 300V 5W-40 2L"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs transition-all"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            {initialPart ? "Số Lượng Tồn Kho Hiện Tại" : "Số Lượng Tồn Kho Ban Đầu"}
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    trigger("tap");
                                    setStock((prev) => Math.max(0, prev - 1));
                                }}
                                className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-lg flex items-center justify-center transition-all cursor-pointer shrink-0"
                                aria-label="Giảm 1"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
                                className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 bg-white font-mono text-center font-extrabold text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    trigger("tap");
                                    setStock((prev) => prev + 1);
                                }}
                                className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-blue-600 font-bold text-lg flex items-center justify-center transition-all cursor-pointer shrink-0"
                                aria-label="Tăng 1"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                            <Save className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
                            <span>
                                {isSubmitting
                                    ? "Đang Lưu..."
                                    : initialPart
                                      ? "Lưu Thay Đổi"
                                      : "Tạo Phụ Tùng"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

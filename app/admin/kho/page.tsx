"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGarageStore } from "@/lib/store/garage-store";
import dynamic from "next/dynamic";
import { Part } from "@/types/garage";

const PartModal = dynamic(() => import("@/components/domain/part-modal").then((mod) => mod.PartModal), { ssr: false });
import { Package, Plus, Search, AlertTriangle, Edit, Trash2, History, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";

function InventoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { parts, deletePart, settings } = useGarageStore();
    const { trigger } = useHaptic();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterLowStock, setFilterLowStock] = useState(searchParams.get("filter") === "low");
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<Part | null>(null);

    // Danh sách phụ tùng đang hoạt động
    const activeParts = useMemo(() => {
        return parts.filter((p) => p.isActive);
    }, [parts]);

    // Số lượng sắp hết hàng
    const lowStockCount = useMemo(() => {
        return activeParts.filter((p) => p.stock <= settings.lowStockThreshold).length;
    }, [activeParts, settings.lowStockThreshold]);

    // Lọc theo tìm kiếm và tồn thấp
    const filteredParts = useMemo(() => {
        return activeParts.filter((p) => {
            if (filterLowStock && p.stock > settings.lowStockThreshold) {
                return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                return p.name.toLowerCase().includes(q);
            }

            return true;
        });
    }, [activeParts, filterLowStock, searchQuery, settings.lowStockThreshold]);

    const handleEdit = (part: Part) => {
        trigger("tap");
        setEditingPart(part);
        setIsPartModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, part: Part) => {
        e.stopPropagation();
        const confirm = window.confirm(`Xác nhận xóa phụ tùng "${part.name}" khỏi danh sách kho?`);
        if (confirm) {
            trigger("warning");
            await deletePart(part.id);
            toast.success(`Đã xóa phụ tùng ${part.name}`);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* Top Header */}
            <div className="flex flex-row items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                        Kho hàng
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href="/admin/kho/lich-su"
                        className="h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Xem lịch sử nhập xuất kho"
                    >
                        <History className="w-4 h-4 text-blue-600" />
                        <span className="hidden sm:inline">Lịch Sử Kho</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            setEditingPart(null);
                            setIsPartModalOpen(true);
                        }}
                        className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Thêm Phụ Tùng</span>
                    </button>
                </div>
            </div>

            {/* Sticky Search & Filter Header trên Mobile */}
            <div className="sticky top-0 z-20 -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 py-2 bg-slate-100/90 backdrop-blur-md space-y-2.5 transition-all">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm tên phụ tùng..."
                        className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200/90 bg-white text-slate-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none shadow-xs placeholder:text-slate-400 transition-all"
                    />
                    {searchQuery.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                trigger("tap");
                                setSearchQuery("");
                            }}
                            className="w-7 h-7 absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Xóa tìm kiếm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Chips Tối Giản: Tất Cả & Sắp Hết Hàng */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            setFilterLowStock(false);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                            !filterLowStock
                                ? "bg-blue-600 text-white shadow-xs shadow-blue-600/30"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-blue-50/50"
                        }`}
                    >
                        <span>Tất cả</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                !filterLowStock ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {activeParts.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            trigger("tap");
                            setFilterLowStock(!filterLowStock);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                            filterLowStock
                                ? "bg-rose-600 text-white shadow-xs shadow-rose-600/30"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-rose-50/50"
                        }`}
                    >
                        <AlertTriangle className={`w-3.5 h-3.5 ${filterLowStock ? "text-white" : "text-rose-500"}`} />
                        <span>Sắp hết (≤ {settings.lowStockThreshold})</span>
                        <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                filterLowStock ? "bg-rose-700 text-white" : "bg-rose-100 text-rose-700"
                            }`}
                        >
                            {lowStockCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* DANH SÁCH PHỤ TÙNG: CARDS TRÊN MOBILE, BẢNG TRÊN DESKTOP */}
            {filteredParts.length > 0 ? (
                <>
                    {/* 1. Mobile Cards View (< 1024px) - Bấm vào thẻ để chỉnh sửa an toàn */}
                    <div className="lg:hidden space-y-3">
                        {filteredParts.map((part) => {
                            const isLow = part.stock <= settings.lowStockThreshold;

                            return (
                                <div
                                    key={part.id}
                                    onClick={() => handleEdit(part)}
                                    className={`group p-4 rounded-2xl border bg-white shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer space-y-3 ${
                                        isLow ? "border-rose-200/90 bg-rose-50/15" : "border-slate-200/90"
                                    }`}
                                >
                                    {/* Tên phụ tùng & Cảnh báo tồn thấp */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            {isLow && (
                                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                                    Sắp hết hàng
                                                </span>
                                            )}
                                            <h2 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                                                {part.name}
                                            </h2>
                                        </div>

                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                                    </div>

                                    {/* Tồn kho & Nút Thao tác */}
                                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">Tồn kho:</span>
                                            <span
                                                className={`font-mono text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${
                                                    isLow
                                                        ? "bg-rose-50 border-rose-200 text-rose-700"
                                                        : "bg-slate-100 border-slate-200 text-slate-800"
                                                }`}
                                            >
                                                {part.stock} món
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            {/* Nút sửa */}
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(part)}
                                                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                                                title="Sửa thông tin & tồn kho"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                                <span>Sửa</span>
                                            </button>

                                            {/* Nút xóa */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(e, part)}
                                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                                                title="Xóa phụ tùng"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 2. Desktop DataTable View (>= 1024px) - BỎ +/- TRỰC TIẾP, BẤM SỬA ĐỂ CẬP NHẬT KHO */}
                    <div className="hidden lg:block rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[11px]">
                                <tr>
                                    <th className="py-3.5 px-4">Tên Phụ Tùng</th>
                                    <th className="py-3.5 px-4 text-center">Tồn Kho Hiện Tại</th>
                                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredParts.map((part) => {
                                    const isLow = part.stock <= settings.lowStockThreshold;

                                    return (
                                        <tr
                                            key={part.id}
                                            onClick={() => handleEdit(part)}
                                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                                isLow ? "bg-rose-50/15" : ""
                                            }`}
                                        >
                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <span>{part.name}</span>
                                                    {isLow && (
                                                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                                            Sắp hết
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center justify-center font-mono text-sm font-extrabold px-3 py-1 rounded-lg border ${
                                                        isLow
                                                            ? "bg-rose-50 border-rose-200 text-rose-700"
                                                            : "bg-slate-100 border-slate-200 text-slate-800"
                                                    }`}
                                                >
                                                    {part.stock} món
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(part)}
                                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                                                        title="Sửa tên & số lượng tồn kho"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                                                        <span>Sửa</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDelete(e, part)}
                                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer active:scale-95"
                                                        title="Xóa phụ tùng"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                /* Empty State */
                <div className="p-10 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Package className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-sm text-slate-800">Không tìm thấy phụ tùng phù hợp</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Thử thay đổi từ khóa tìm kiếm hoặc kiểm tra bộ lọc cảnh báo kho.
                    </p>
                    {(searchQuery || filterLowStock) && (
                        <button
                            type="button"
                            onClick={() => {
                                trigger("tap");
                                setSearchQuery("");
                                setFilterLowStock(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Xóa bộ lọc</span>
                        </button>
                    )}
                </div>
            )}

            {/* PartModal thêm/sửa gọn nhẹ và an toàn */}
            <PartModal isOpen={isPartModalOpen} onClose={() => setIsPartModalOpen(false)} initialPart={editingPart} />
        </div>
    );
}

export default function InventoryPage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                    Đang tải dữ liệu kho phụ tùng...
                </div>
            }
        >
            <InventoryContent />
        </Suspense>
    );
}

"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, Suspense } from "react";
import { useGarageStore } from "@/lib/store/garage-store";
import { normalizePlate, sanitizePlateInput } from "@/lib/plate";
import { formatDateVN } from "@/lib/format";
import { addMonthsToDate, todayVN } from "@/lib/warranty";
import { Vehicle } from "@/types/garage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema, type TicketFormValues } from "@/lib/validations";
import {
    X,
    Plus,
    Trash2,
    FileCheck2,
    Car,
    Calendar,
    AlertTriangle,
    AlertCircle,
    Search,
    Wrench,
    Check,
    PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";
import dynamic from "next/dynamic";
const PartModal = dynamic(() => import("./part-modal").then((mod) => mod.PartModal), { ssr: false });
import { LicensePlate } from "./license-plate";
import { useRouter, useSearchParams } from "next/navigation";
import { useUIStore } from "@/lib/store/ui-store";

interface SelectedItem {
    partId: string;
    quantity: number;
    warrantyMonths?: number;
    serial?: string;
}

interface OpenModalParams {
    ticketId?: string;
    vehicle?: Partial<Vehicle>;
    items?: SelectedItem[];
    odo?: number;
    note?: string;
}

interface TicketModalContextType {
    openTicketModal: (params?: OpenModalParams) => void;
    closeTicketModal: () => void;
}

const TicketModalContext = createContext<TicketModalContextType | null>(null);

export function useTicketModal() {
    const context = useContext(TicketModalContext);
    if (!context) {
        throw new Error("useTicketModal must be used within TicketModalProvider");
    }
    return context;
}

function DeepLinkHandler({ onTrigger }: { onTrigger: () => void }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get("tao-phieu") === "1") {
            onTrigger();
        }
    }, [searchParams, onTrigger]);
    return null;
}

const STANDARD_MONTH_OPTIONS = [
    { value: 12, label: "12 tháng (1 năm)" },
    { value: 3, label: "3 tháng" },
    { value: 6, label: "6 tháng" },
    { value: 18, label: "18 tháng" },
    { value: 24, label: "24 tháng (2 năm)" },
    { value: 36, label: "36 tháng (3 năm)" },
    { value: 0, label: "Không bảo hành (0T)" },
    { value: -1, label: "Số tháng khác..." },
];

const STANDARD_VALUES = [12, 3, 6, 18, 24, 36, 0];

export function TicketModalProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { vehicles, parts, saveTicket } = useGarageStore();
    const { trigger } = useHaptic();

    const [isOpen, setIsOpen] = useState(false);
    const [ticketId, setTicketId] = useState<string | undefined>(undefined);
    const [customWarrantyIndexes, setCustomWarrantyIndexes] = useState<number[]>([]);

    // Search phụ tùng
    const [partSearchQuery, setPartSearchQuery] = useState("");
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // React Hook Form với Zod validation
    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            plate: "",
            plateColor: "white",
            model: "",
            ownerName: "",
            ownerPhone: "",
            items: [],
            note: "",
        },
    });

    const plate = watch("plate") || "";
    const plateColor = watch("plateColor") || "white";
    const model = watch("model") || "";
    const ownerName = watch("ownerName") || "";
    const ownerPhone = watch("ownerPhone") || "";
    const note = watch("note") || "";
    const selectedItems = watch("items") || [];

    const openTicketModal = (params?: OpenModalParams) => {
        setError("");
        setPartSearchQuery("");
        const items = (params?.items || []).map((it) => ({
            partId: it.partId,
            quantity: it.quantity,
            warrantyMonths: typeof it.warrantyMonths === "number" ? it.warrantyMonths : 12,
            serial: it.serial,
        }));

        if (params) {
            setTicketId(params.ticketId);
            reset({
                plate: params.vehicle?.plate || "",
                plateColor: (params.vehicle?.plateColor as "white" | "yellow") || "white",
                model: params.vehicle?.model || "",
                ownerName: params.vehicle?.ownerName || "",
                ownerPhone: params.vehicle?.ownerPhone || "",
                note: params.note || "",
                items,
            });
            // Check if any items have non-standard warranty months
            const customs: number[] = [];
            items.forEach((it, idx) => {
                const m = it.warrantyMonths ?? 12;
                if (!STANDARD_VALUES.includes(m)) customs.push(idx);
            });
            setCustomWarrantyIndexes(customs);
        } else {
            setTicketId(undefined);
            reset({
                plate: "",
                plateColor: "white",
                model: "",
                ownerName: "",
                ownerPhone: "",
                note: "",
                items: [],
            });
            setCustomWarrantyIndexes([]);
        }
        setIsOpen(true);
    };

    const closeTicketModal = () => {
        setIsOpen(false);
    };

    const hideBottomNav = useUIStore((state) => state.hideBottomNav);
    const showBottomNav = useUIStore((state) => state.showBottomNav);

    useEffect(() => {
        if (!isOpen) return;
        hideBottomNav();
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            showBottomNav();
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, hideBottomNav, showBottomNav]);

    // Tự điền thông tin nếu biển số đã tồn tại khi rời ô biển số
    const handlePlateBlur = () => {
        const norm = normalizePlate(plate);
        if (norm.length >= 5) {
            const match = vehicles.find((v) => v.plateNormalized === norm);
            if (match) {
                setValue("plateColor", match.plateColor, { shouldValidate: true });
                if (!model) setValue("model", match.model, { shouldValidate: true });
                if (!ownerName && match.ownerName) setValue("ownerName", match.ownerName, { shouldValidate: true });
                if (!ownerPhone && match.ownerPhone) setValue("ownerPhone", match.ownerPhone, { shouldValidate: true });
                toast.info(`Đã tìm thấy xe cũ: ${match.model} (${match.ownerName || "Chưa rõ tên"})`);
            }
        }
    };

    const addItem = (partId: string) => {
        const existIdx = selectedItems.findIndex((it) => it.partId === partId);
        let updated: TicketFormValues["items"] = [];
        if (existIdx >= 0) {
            updated = [...selectedItems];
            updated[existIdx].quantity += 1;
        } else {
            const part = parts.find((p) => p.id === partId);
            updated = [
                ...selectedItems,
                {
                    partId,
                    quantity: 1,
                    warrantyMonths:
                        typeof part?.warrantyMonths === "number" && part.warrantyMonths > 0 ? part.warrantyMonths : 12,
                },
            ];
        }
        setValue("items", updated, { shouldValidate: true });
        trigger("tap");
    };

    const updateItemQty = (index: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(index);
            return;
        }
        const updated = [...selectedItems];
        updated[index].quantity = quantity;
        setValue("items", updated, { shouldValidate: true });
    };

    const updateItemWarranty = (index: number, warrantyMonths: number) => {
        const updated = [...selectedItems];
        updated[index].warrantyMonths = Math.max(0, warrantyMonths);
        setValue("items", updated, { shouldValidate: true });
    };

    const removeItem = (index: number) => {
        const updated = selectedItems.filter((_, idx) => idx !== index);
        setValue("items", updated, { shouldValidate: true });
        setCustomWarrantyIndexes((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
        trigger("tap");
    };

    // Danh sách phụ tùng kho được lọc theo ô tìm kiếm
    const filteredWarehouseParts = useMemo(() => {
        const active = parts.filter((p) => p.isActive);
        const q = partSearchQuery.trim().toLowerCase();
        if (!q) return active.slice(0, 10);
        return active.filter((p) => p.name.toLowerCase().includes(q));
    }, [parts, partSearchQuery]);

    // Tính hạn bảo hành dài nhất
    const today = todayVN();
    let maxWarrantyExpiresOn = today;
    for (const item of selectedItems) {
        const wMonths = typeof item.warrantyMonths === "number" ? item.warrantyMonths : 0;
        if (wMonths > 0) {
            const exp = addMonthsToDate(today, wMonths);
            if (exp > maxWarrantyExpiresOn) maxWarrantyExpiresOn = exp;
        }
    }

    const onSubmit = async (values: TicketFormValues) => {
        if (isSubmitting) return;
        setError("");

        try {
            setIsSubmitting(true);
            const res = await saveTicket({
                ticketId,
                vehicle: {
                    plate: values.plate.trim().toUpperCase(),
                    plateColor: values.plateColor,
                    model: values.model.trim(),
                    ownerName: (values.ownerName || "").trim(),
                    ownerPhone: (values.ownerPhone || "").trim(),
                },
                odo: 0,
                items: values.items,
                note: (values.note || "").trim(),
            });

            if (!res.ok) {
                setError(res.error || "Có lỗi xảy ra khi lưu phiếu");
                trigger("error");
                return;
            }

            trigger("success");
            toast.success(ticketId ? "Đã cập nhật phiếu bảo hành!" : "Đã kích hoạt bảo hành thành công!");
            closeTicketModal();
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid = (fieldErrors: typeof errors) => {
        trigger("error");
        const firstErrorMessage =
            fieldErrors.plate?.message ||
            fieldErrors.model?.message ||
            fieldErrors.ownerName?.message ||
            fieldErrors.ownerPhone?.message ||
            fieldErrors.items?.message ||
            "Vui lòng kiểm tra lại thông tin nhập liệu";
        toast.error(firstErrorMessage);
    };

    return (
        <TicketModalContext.Provider value={{ openTicketModal, closeTicketModal }}>
            <Suspense fallback={null}>
                <DeepLinkHandler onTrigger={() => openTicketModal()} />
            </Suspense>
            {children}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="force-light w-full max-w-2xl bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
                        {/* Mobile Drag Indicator */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden mt-2.5 mb-1" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                                    <FileCheck2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                                        {ticketId ? "Chỉnh Sửa Phiếu Bảo Hành" : "Tạo Phiếu Bảo Hành Mới"}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Đồng bộ tồn kho & thời hạn bảo hành khách hàng
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeTicketModal}
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                title="Đóng"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Scroll Area */}
                        <form
                            id="ticket-modal-form"
                            onSubmit={handleSubmit(onSubmit, onInvalid)}
                            className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-slate-100/70"
                        >
                            {error && (
                                <div className="p-3 text-xs sm:text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 font-medium animate-in fade-in shadow-2xs">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* KHỐI 1: THÔNG TIN XE */}
                            <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                        <Car className="w-4 h-4 text-blue-600" />
                                        1. Thông tin phương tiện
                                    </span>
                                    {plate && <LicensePlate plate={plate} color={plateColor} size="sm" />}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            BIỂN SỐ XE *
                                        </label>
                                        <input
                                            type="text"
                                            value={plate}
                                            onChange={(e) => {
                                                const val = sanitizePlateInput(e.target.value);
                                                setValue("plate", val, { shouldValidate: true });
                                            }}
                                            onBlur={handlePlateBlur}
                                            placeholder="VD: 51K-889.99"
                                            className={`w-full h-11 px-3.5 rounded-xl border bg-white font-mono text-base uppercase font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 shadow-2xs transition-colors ${
                                                errors.plate
                                                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20"
                                                    : "border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                                            }`}
                                        />
                                        {errors.plate && (
                                            <p className="text-2xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                <span>{errors.plate.message}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            MÀU BIỂN SỐ
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5 h-11 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
                                            <button
                                                type="button"
                                                onClick={() => setValue("plateColor", "white", { shouldValidate: true })}
                                                className={`text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
                                                    plateColor === "white"
                                                        ? "bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs"
                                                        : "text-slate-500 hover:text-slate-900"
                                                }`}
                                            >
                                                Trắng
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setValue("plateColor", "yellow", { shouldValidate: true })}
                                                className={`text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
                                                    plateColor === "yellow"
                                                        ? "bg-amber-400 text-slate-900 shadow-2xs"
                                                        : "text-slate-500 hover:text-slate-900"
                                                }`}
                                            >
                                                Vàng
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            DÒNG XE (MODEL) *
                                        </label>
                                        <input
                                            type="text"
                                            value={model}
                                            onChange={(e) => setValue("model", e.target.value, { shouldValidate: true })}
                                            placeholder="VD: Mazda CX-5 2.0"
                                            className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 shadow-2xs transition-colors ${
                                                errors.model
                                                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20"
                                                    : "border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                                            }`}
                                        />
                                        {errors.model && (
                                            <p className="text-2xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                <span>{errors.model.message}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            CHỦ XE *
                                        </label>
                                        <input
                                            type="text"
                                            value={ownerName}
                                            onChange={(e) => setValue("ownerName", e.target.value, { shouldValidate: true })}
                                            placeholder="Họ tên chủ xe"
                                            className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 shadow-2xs transition-colors ${
                                                errors.ownerName
                                                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20"
                                                    : "border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                                            }`}
                                        />
                                        {errors.ownerName && (
                                            <p className="text-2xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                <span>{errors.ownerName.message}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            SỐ ĐIỆN THOẠI *
                                        </label>
                                        <input
                                            type="tel"
                                            value={ownerPhone}
                                            onChange={(e) => setValue("ownerPhone", e.target.value, { shouldValidate: true })}
                                            placeholder="VD: 0988123456"
                                            className={`w-full h-11 px-3.5 rounded-xl border bg-white font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 shadow-2xs transition-colors ${
                                                errors.ownerPhone
                                                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20"
                                                    : "border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                                            }`}
                                        />
                                        {errors.ownerPhone && (
                                            <p className="text-2xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in">
                                                <AlertCircle className="w-3 h-3 shrink-0" />
                                                <span>{errors.ownerPhone.message}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI 2: CHỌN PHỤ TÙNG TỪ KHO */}
                            <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                        <Wrench className="w-4 h-4 text-blue-600" />
                                        2. Chọn phụ tùng từ kho
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        {filteredWarehouseParts.length} mặt hàng
                                    </span>
                                </div>

                                {/* 1. Thanh tìm kiếm nhanh phụ tùng kho + Nút Thêm mới */}
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={partSearchQuery}
                                            onChange={(e) => setPartSearchQuery(e.target.value)}
                                            placeholder="Tìm nhanh khi kho có nhiều phụ tùng..."
                                            className="w-full h-10 sm:h-11 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs transition-colors"
                                        />
                                        {partSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setPartSearchQuery("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                                title="Xóa tìm kiếm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsPartModalOpen(true)}
                                        className="h-10 sm:h-11 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shrink-0 shadow-2xs transition-all active:scale-95"
                                        title="Thêm mới phụ tùng vào kho"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Thêm mới</span>
                                    </button>
                                </div>

                                {/* 2. Danh sách phụ tùng kho hiển thị trực tiếp để chọn nhanh */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        <span>Chọn từ kho phụ tùng ({filteredWarehouseParts.length})</span>
                                        {partSearchQuery && (
                                            <span className="text-blue-600 font-normal normal-case">
                                                Lọc theo &ldquo;{partSearchQuery}&rdquo;
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 sm:max-h-52 overflow-y-auto p-0.5">
                                        {filteredWarehouseParts.length > 0 ? (
                                            filteredWarehouseParts.map((p) => {
                                                const selectedItem = selectedItems.find((it) => it.partId === p.id);
                                                const isChosen = !!selectedItem;
                                                const isOutOfStock = p.stock <= 0;

                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        disabled={isOutOfStock}
                                                        onClick={() => addItem(p.id)}
                                                        className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all active:scale-[0.98] ${
                                                            isChosen
                                                                ? "border-blue-500 bg-blue-50/90 text-blue-950 font-medium ring-1 ring-blue-500/30 shadow-xs"
                                                                : "border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-800 shadow-2xs"
                                                        } ${isOutOfStock ? "opacity-40 cursor-not-allowed bg-slate-100" : "cursor-pointer"}`}
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                                                                {p.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                                                                <span
                                                                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                                                                        p.stock > 0
                                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                                            : "bg-rose-50 text-rose-700 border border-rose-200/60"
                                                                    }`}
                                                                >
                                                                    Tồn: {p.stock}
                                                                </span>
                                                                {isChosen && (
                                                                    <span className="text-blue-700 font-sans font-bold text-[11px] flex items-center gap-0.5">
                                                                        <Check className="w-3 h-3 text-blue-600" />
                                                                        Đã chọn ({selectedItem.quantity})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <span
                                                            className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                                                                isChosen
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white"
                                                            }`}
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white space-y-2">
                                                <p>Không tìm thấy phụ tùng &quot;{partSearchQuery}&quot; trong kho</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPartModalOpen(true)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Thêm &quot;{partSearchQuery}&quot; vào kho ngay
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI 3: PHỤ TÙNG ĐÃ CHỌN VÀO PHIẾU (TÁCH BIỆT THÀNH CARD RIÊNG) */}
                            <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-white border-2 border-blue-400/90 shadow-xs ring-4 ring-blue-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-2xs">
                                            <PackageCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                                                3. Phụ tùng trong phiếu
                                            </span>
                                        </div>
                                    </div>
                                    {selectedItems.length > 0 && (
                                        <span className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-full shadow-2xs">
                                            {selectedItems.reduce((sum, it) => sum + it.quantity, 0)} món
                                        </span>
                                    )}
                                </div>

                                {errors.items && (
                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                                        <span>{errors.items.message}</span>
                                    </div>
                                )}

                                {selectedItems.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {selectedItems.map((item, idx) => {
                                            const part = parts.find((p) => p.id === item.partId);
                                            if (!part) return null;

                                            const wMonths =
                                                typeof item.warrantyMonths === "number" ? item.warrantyMonths : 12;
                                            const itemExpires = wMonths > 0 ? addMonthsToDate(today, wMonths) : null;
                                            const isCustom =
                                                customWarrantyIndexes.includes(idx) ||
                                                !STANDARD_VALUES.includes(wMonths);

                                            return (
                                                <div
                                                    key={item.partId}
                                                    className="p-3 sm:p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white space-y-3 shadow-xs"
                                                >
                                                    {/* Row 1: Tên phụ tùng + nút xóa */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-sm text-slate-900 leading-snug">
                                                                {part.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[11px] text-slate-500 font-mono">
                                                                    Kho còn:{" "}
                                                                    <strong className="text-slate-700">
                                                                        {part.stock}
                                                                    </strong>
                                                                </span>
                                                                {wMonths > 0 && itemExpires ? (
                                                                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-mono">
                                                                        Đến {formatDateVN(itemExpires)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                                                        Không có hạn
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                                                            title="Bỏ phụ tùng này"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Row 2: Bộ chọn số lượng & Dropdown thời gian bảo hành */}
                                                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
                                                        {/* Stepper số lượng */}
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-slate-500 font-medium">
                                                                SL:
                                                            </span>
                                                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateItemQty(idx, item.quantity - 1)
                                                                    }
                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 font-bold text-xs text-slate-700 transition-colors"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="w-8 text-center text-xs font-mono font-bold text-slate-900 bg-white h-8 flex items-center justify-center border-x border-slate-200">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateItemQty(idx, item.quantity + 1)
                                                                    }
                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 font-bold text-xs text-blue-600 transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Dropdown bảo hành tiết kiệm không gian */}
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-slate-500 font-medium">
                                                                BH:
                                                            </span>
                                                            <select
                                                                value={isCustom ? -1 : wMonths}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    if (val === -1) {
                                                                        setCustomWarrantyIndexes((prev) =>
                                                                            prev.includes(idx) ? prev : [...prev, idx],
                                                                        );
                                                                    } else {
                                                                        setCustomWarrantyIndexes((prev) =>
                                                                            prev.filter((i) => i !== idx),
                                                                        );
                                                                        updateItemWarranty(idx, val);
                                                                    }
                                                                }}
                                                                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-2xs"
                                                            >
                                                                {STANDARD_MONTH_OPTIONS.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {/* Ô nhập số tháng tùy chỉnh khi chọn Số tháng khác */}
                                                            {isCustom && (
                                                                <div className="flex items-center gap-1">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={120}
                                                                        value={wMonths}
                                                                        onChange={(e) =>
                                                                            updateItemWarranty(
                                                                                idx,
                                                                                Math.max(
                                                                                    0,
                                                                                    parseInt(e.target.value) || 0,
                                                                                ),
                                                                            )
                                                                        }
                                                                        placeholder="Tháng"
                                                                        className="w-14 h-8 px-1.5 text-center text-xs font-mono font-bold text-slate-900 bg-white border border-blue-500 rounded-lg focus:outline-none shadow-2xs"
                                                                    />
                                                                    <span className="text-xs text-slate-500 font-medium">
                                                                        tháng
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 px-4 text-xs text-slate-500 border border-dashed border-blue-200 rounded-xl bg-white/70 space-y-1">
                                        <p className="font-semibold text-slate-700">Chưa có phụ tùng nào trong phiếu</p>
                                        <p className="text-slate-400">
                                            Chạm vào phụ tùng ở Khối 2 bên trên để đưa vào phiếu bảo hành
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* KHỐI 4: GHI CHÚ */}
                            <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                                    4. Ghi chú hồ sơ / tình trạng xe
                                </label>
                                <textarea
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setValue("note", e.target.value, { shouldValidate: true })}
                                    placeholder="Ghi chú về phụ tùng, khuyến cáo lần bảo dưỡng tới..."
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs transition-colors"
                                />
                            </div>

                            {/* TÓM TẮT THỜI HẠN */}
                            {selectedItems.length > 0 && (
                                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-300/80 shadow-xs flex items-center justify-between text-xs sm:text-sm">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 shadow-2xs">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-emerald-950 font-bold block sm:inline">
                                                Thời hạn bảo hành thẻ:
                                            </span>
                                            <span className="text-[11px] text-emerald-700/80 font-medium sm:ml-1">
                                                Tự động lấy hạn dài nhất
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-emerald-700 font-mono text-sm sm:text-base">
                                        Đến {formatDateVN(maxWarrantyExpiresOn)}
                                    </span>
                                </div>
                            )}

                            {/* Bottom padding for sticky footer space */}
                            <div className="h-2" />
                        </form>

                        {/* Sticky Action Footer */}
                        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs p-4 sm:px-6 sm:py-4 border-t border-slate-100 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={closeTicketModal}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    const form = (
                                        e.currentTarget.closest(".force-light") as HTMLElement
                                    )?.querySelector("form");
                                    form?.requestSubmit();
                                }}
                                disabled={isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.99]"
                            >
                                <FileCheck2 className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
                                <span>
                                    {isSubmitting ? "Đang Lưu..." : ticketId ? "Cập Nhật Phiếu" : "Kích Hoạt Bảo Hành"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PartModal để thêm phụ tùng mới vào kho ngay lập tức */}
            <PartModal
                isOpen={isPartModalOpen}
                onClose={() => setIsPartModalOpen(false)}
                onCreatedSuccess={(newPartId) => {
                    if (newPartId) {
                        addItem(newPartId);
                        toast.success("Đã thêm phụ tùng mới và đưa vào phiếu!");
                    }
                }}
            />
        </TicketModalContext.Provider>
    );
}

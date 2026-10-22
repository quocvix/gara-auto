"use client";

import React, { createContext, use, useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { useGarageStore } from "@/lib/store/garage-store";
import { normalizePlate, sanitizePlateInput } from "@/lib/plate";
import { formatDateVN } from "@/lib/format";
import { addMonthsToDate, addDaysToDate, todayVN } from "@/lib/warranty";
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
    Pipette,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";
import dynamic from "next/dynamic";
const PartModal = dynamic(() => import("./part-modal").then((mod) => mod.PartModal), { ssr: false });
import { LicensePlate } from "./license-plate";
import { DatePicker } from "@/components/ui/date-picker";
import { ColorPickerModal } from "@/components/ui/color-picker";
import { POPULAR_CAR_COLORS, getCarColorConfig } from "@/lib/car-colors";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { useUIStore } from "@/lib/store/ui-store";

interface SelectedItem {
    partId: string;
    quantity: number;
    warrantyMonths?: number;
    activatedOn?: string;
}

interface OpenModalParams {
    ticketId?: string;
    vehicle?: Partial<Vehicle>;
    items?: SelectedItem[];
    note?: string;
    activatedOn?: string;
}

interface TicketModalContextType {
    openTicketModal: (params?: OpenModalParams) => void;
    closeTicketModal: () => void;
}

const TicketModalContext = createContext<TicketModalContextType | null>(null);

export function useTicketModal() {
    const context = use(TicketModalContext);
    if (!context) {
        throw new Error("useTicketModal must be used within TicketModalProvider");
    }
    return context;
}

function DeepLinkHandler({ onTrigger }: { onTrigger: () => void }) {
    const [taoPhieu, setTaoPhieu] = useQueryState("tao-phieu", parseAsString);
    useEffect(() => {
        if (taoPhieu === "1") {
            onTrigger();
            setTaoPhieu(null);
        }
    }, [taoPhieu, onTrigger, setTaoPhieu]);
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
    { value: -1, label: "Số tháng khác…" },
];

const STANDARD_VALUES = [12, 3, 6, 18, 24, 36, 0];

export function TicketModalProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const vehicles = useGarageStore((s) => s.vehicles);
    const parts = useGarageStore((s) => s.parts);
    const saveTicket = useGarageStore((s) => s.saveTicket);
    const { trigger } = useHaptic();

    const [isOpen, setIsOpen] = useState(false);
    const [ticketId, setTicketId] = useState<string | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<"info" | "parts">("info");
    const [customWarrantyIndexes, setCustomWarrantyIndexes] = useState<number[]>([]);

    // Search & danh mục phụ tùng kho (Inline Catalog)
    const [partSearchQuery, setPartSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
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
            color: "",
            ownerName: "",
            ownerPhone: "",
            activatedOn: todayVN(),
            items: [],
            note: "",
        },
    });

    const plate = watch("plate") || "";
    const plateColor = watch("plateColor") || "white";
    const model = watch("model") || "";
    const color = watch("color") || "";
    const ownerName = watch("ownerName") || "";
    const ownerPhone = watch("ownerPhone") || "";
    const activatedOn = watch("activatedOn") || todayVN();
    const note = watch("note") || "";
    const selectedItems = watch("items") || [];

    const colorConfig = getCarColorConfig(color);

    const openTicketModal = useCallback(
        (params?: OpenModalParams) => {
            setError("");
            setPartSearchQuery("");
            setSelectedCategory("all");
            setActiveTab("info");
            const ticketDate = params?.activatedOn || todayVN();
            const items = (params?.items || []).map((it) => ({
                partId: it.partId,
                quantity: it.quantity,
                warrantyMonths: typeof it.warrantyMonths === "number" ? it.warrantyMonths : 12,
                activatedOn: it.activatedOn || ticketDate,
            }));

            if (params) {
                setTicketId(params.ticketId);
                reset({
                    plate: params.vehicle?.plate || "",
                    plateColor: (params.vehicle?.plateColor as "white" | "yellow") || "white",
                    model: params.vehicle?.model || "",
                    color: params.vehicle?.color || "",
                    ownerName: params.vehicle?.ownerName || "",
                    ownerPhone: params.vehicle?.ownerPhone || "",
                    activatedOn: ticketDate,
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
                    color: "",
                    ownerName: "",
                    ownerPhone: "",
                    activatedOn: todayVN(),
                    note: "",
                    items: [],
                });
                setCustomWarrantyIndexes([]);
            }
            setIsOpen(true);
        },
        [reset],
    );

    const closeTicketModal = useCallback(() => {
        setIsOpen(false);
    }, []);

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
                if (!color && match.color) setValue("color", match.color, { shouldValidate: true });
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
                    activatedOn: activatedOn || todayVN(),
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

    const updateItemActivatedOn = (index: number, dateStr: string) => {
        const updated = [...selectedItems];
        updated[index].activatedOn = dateStr;
        setValue("items", updated, { shouldValidate: true });
    };

    const removeItem = (index: number) => {
        const updated = selectedItems.filter((_, idx) => idx !== index);
        setValue("items", updated, { shouldValidate: true });
        setCustomWarrantyIndexes((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
        trigger("tap");
    };

    // Danh sách phân loại danh mục từ phụ tùng đang hoạt động
    const partCategories = useMemo(() => {
        const set = new Set<string>();
        for (const p of parts) {
            if (p.isActive && p.category && p.category.trim()) {
                set.add(p.category.trim());
            }
        }
        return Array.from(set);
    }, [parts]);

    // Danh sách phụ tùng kho được lọc theo ô tìm kiếm & danh mục
    const filteredWarehouseParts = useMemo(() => {
        const q = partSearchQuery.trim().toLowerCase();
        return parts.filter((p) => {
            if (!p.isActive) return false;
            if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
            if (!q) return true;
            return p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
        });
    }, [parts, partSearchQuery, selectedCategory]);

    // Map tra cứu nhanh số lượng đã chọn theo partId: O(1)
    const selectedItemMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const it of selectedItems) {
            map.set(it.partId, it.quantity);
        }
        return map;
    }, [selectedItems]);

    const onSubmit = async (values: TicketFormValues) => {
        if (isSubmitting) return;
        setError("");

        try {
            setIsSubmitting(true);
            const ticketActivatedDate = values.activatedOn || todayVN();
            const res = await saveTicket({
                ticketId,
                activatedOn: ticketActivatedDate,
                vehicle: {
                    plate: values.plate.trim().toUpperCase(),
                    plateColor: values.plateColor,
                    model: values.model.trim(),
                    color: (values.color || "").trim(),
                    ownerName: (values.ownerName || "").trim(),
                    ownerPhone: (values.ownerPhone || "").trim(),
                },
                items: values.items.map((it) => ({
                    partId: it.partId,
                    quantity: it.quantity,
                    warrantyMonths: it.warrantyMonths,
                    activatedOn: it.activatedOn || ticketActivatedDate,
                })),
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
        // Tự động chuyển đến Tab có lỗi tương ứng
        if (fieldErrors.plate || fieldErrors.model || fieldErrors.ownerName || fieldErrors.ownerPhone) {
            setActiveTab("info");
        } else if (fieldErrors.items) {
            setActiveTab("parts");
        }
        const firstErrorMessage =
            fieldErrors.plate?.message ||
            fieldErrors.model?.message ||
            fieldErrors.ownerName?.message ||
            fieldErrors.ownerPhone?.message ||
            fieldErrors.items?.message ||
            "Vui lòng kiểm tra lại thông tin nhập liệu";
        toast.error(firstErrorMessage);
    };

    const contextValue = useMemo(() => ({ openTicketModal, closeTicketModal }), [openTicketModal, closeTicketModal]);

    return (
        <TicketModalContext.Provider value={contextValue}>
            <Suspense fallback={null}>
                <DeepLinkHandler onTrigger={openTicketModal} />
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

                        {/* 2-Tab Segmented Navigation */}
                        <div className="px-3 sm:px-6 pt-3 pb-2.5 bg-white border-b border-slate-200/80 flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab("info")}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    activeTab === "info"
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                                }`}
                            >
                                <Car className="w-4 h-4" />
                                <span>1. Thông tin xe</span>
                                {(errors.plate || errors.model || errors.ownerName || errors.ownerPhone) && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("parts")}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    activeTab === "parts"
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                                }`}
                            >
                                <PackageCheck className="w-4 h-4" />
                                <span>2. Phụ tùng</span>
                                {selectedItems.length > 0 && (
                                    <span
                                        className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold ${
                                            activeTab === "parts" ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                                        }`}
                                    >
                                        {selectedItems.reduce((sum, it) => sum + it.quantity, 0)}
                                    </span>
                                )}
                                {errors.items && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                            </button>
                        </div>

                        {/* Form Scroll Area */}
                        <form
                            id="ticket-modal-form"
                            onSubmit={handleSubmit(onSubmit, onInvalid)}
                            className="p-3 sm:p-5 overflow-y-auto flex-1 bg-[#E9EEF5]"
                        >
                            {error && (
                                <div className="p-3 mb-4 text-xs sm:text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 font-medium animate-in fade-in shadow-2xs">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* TAB 1: THÔNG TIN PHƯƠNG TIỆN & GHI CHÚ */}
                            {activeTab === "info" && (
                                <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
                                    {/* KHỐI 1: THÔNG TIN XE */}
                                    <div className="space-y-3.5 p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                                <Car className="w-4 h-4 text-blue-600" />
                                                Thông tin phương tiện
                                            </span>
                                            {plate && <LicensePlate plate={plate} color={plateColor} size="sm" />}
                                        </div>

                                        {/* NGÀY TẠO / KÍCH HOẠT PHIẾU */}
                                        <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                    Ngày lập phiếu
                                                </label>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setValue("activatedOn", todayVN(), { shouldValidate: true })
                                                        }
                                                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                                                            activatedOn === todayVN()
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        Hôm nay
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setValue("activatedOn", addDaysToDate(todayVN(), -1), {
                                                                shouldValidate: true,
                                                            })
                                                        }
                                                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                                                            activatedOn === addDaysToDate(todayVN(), -1)
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        Hôm qua
                                                    </button>
                                                </div>
                                            </div>
                                            <DatePicker
                                                id="ticket-activated-on"
                                                value={activatedOn}
                                                onChange={(dateStr) =>
                                                    setValue("activatedOn", dateStr, { shouldValidate: true })
                                                }
                                                placeholder="Chọn ngày kích hoạt"
                                            />
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
                                                        onClick={() =>
                                                            setValue("plateColor", "white", { shouldValidate: true })
                                                        }
                                                        className={`text-xs font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                                            plateColor === "white"
                                                                ? "bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs"
                                                                : "text-slate-500 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        Trắng
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setValue("plateColor", "yellow", { shouldValidate: true })
                                                        }
                                                        className={`text-xs font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
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

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    DÒNG XE (MODEL) *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={model}
                                                    onChange={(e) =>
                                                        setValue("model", e.target.value, { shouldValidate: true })
                                                    }
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
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-xs font-semibold text-slate-700">
                                                        MÀU SƠN XE
                                                    </label>
                                                    {colorConfig ? (
                                                        <span className="text-[11px] font-mono font-semibold text-blue-600 flex items-center gap-1">
                                                            <span>{colorConfig.name}</span>
                                                            <span className="text-slate-400">({colorConfig.hex})</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400">Chưa chọn</span>
                                                    )}
                                                </div>

                                                {/* Thanh Swatches 1 chạm tối ưu cho mobile */}
                                                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto scrollbar-none">
                                                    {/* Custom Color Picker Pipette Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsColorPickerOpen(true)}
                                                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white shrink-0 flex items-center justify-center cursor-pointer shadow-2xs relative transition-all hover:scale-105 active:scale-95 hover:bg-slate-50"
                                                        title="Mở bảng pha màu chi tiết"
                                                    >
                                                        <Pipette className="w-4 h-4 text-blue-600" />
                                                    </button>

                                                    {/* 10 màu phổ biến */}
                                                    {POPULAR_CAR_COLORS.map((c) => {
                                                        const isSelected =
                                                            color.trim().toLowerCase() === c.hex.toLowerCase() ||
                                                            color.trim().toLowerCase() === c.name.toLowerCase();

                                                        return (
                                                            <button
                                                                key={c.name}
                                                                type="button"
                                                                onClick={() =>
                                                                    setValue("color", c.hex, { shouldValidate: true })
                                                                }
                                                                title={c.name}
                                                                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs relative ${
                                                                    isSelected
                                                                        ? "ring-2 ring-blue-600 ring-offset-1 scale-105"
                                                                        : "hover:scale-105"
                                                                }`}
                                                                style={{
                                                                    backgroundColor: c.hex,
                                                                    border: c.border
                                                                        ? `1px solid ${c.border}`
                                                                        : "1px solid rgba(0,0,0,0.15)",
                                                                }}
                                                            >
                                                                {isSelected && (
                                                                    <Check
                                                                        className="w-4 h-4 stroke-[3]"
                                                                        style={{ color: c.textColor || "#FFFFFF" }}
                                                                    />
                                                                )}
                                                            </button>
                                                        );
                                                    })}

                                                    {/* Nút Xóa màu */}
                                                    {color && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setValue("color", "", { shouldValidate: true })
                                                            }
                                                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                                                            title="Xóa màu xe"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>

                                                <ColorPickerModal
                                                    isOpen={isColorPickerOpen}
                                                    onClose={() => setIsColorPickerOpen(false)}
                                                    color={colorConfig?.hex || color || "#2563EB"}
                                                    onChange={(newHex) => {
                                                        setValue("color", newHex, { shouldValidate: true });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    CHỦ XE *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={ownerName}
                                                    onChange={(e) =>
                                                        setValue("ownerName", e.target.value, { shouldValidate: true })
                                                    }
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
                                                    onChange={(e) =>
                                                        setValue("ownerPhone", e.target.value, { shouldValidate: true })
                                                    }
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

                                    {/* KHỐI: GHI CHÚ PHIẾU */}
                                    <div className="space-y-2 p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                                            Ghi chú phiếu
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={note}
                                            onChange={(e) => setValue("note", e.target.value, { shouldValidate: true })}
                                            placeholder="Ghi chú về phụ tùng hoặc dặn dò khách hàng..."
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs transition-colors"
                                        />
                                    </div>

                                    {/* Nút Tiếp tục chuyển sang Tab 2 */}
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("parts")}
                                            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                                        >
                                            <span>Tiếp tục: Chọn phụ tùng vào phiếu</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CHỌN & QUẢN LÝ PHỤ TÙNG */}
                            {activeTab === "parts" && (
                                <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
                                    {/* KHỐI 2: KHO PHỤ TÙNG SẴN CÓ (HIỆN THỰC THÁI TRỰC TIẾP, KHÔNG CẦN BẤM DROPDOWN) */}
                                    <div className="space-y-3.5 p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                                <Wrench className="w-4 h-4 text-blue-600" />
                                                Chọn phụ tùng từ kho
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                                {parts.filter((p) => p.isActive).length} mặt hàng
                                            </span>
                                        </div>

                                        {/* Thanh Tìm Kiếm & Nút Tạo Mới Phụ Tùng */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={partSearchQuery}
                                                    onChange={(e) => setPartSearchQuery(e.target.value)}
                                                    placeholder="Gõ tên hoặc loại phụ tùng để lọc nhanh…"
                                                    className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs transition-colors"
                                                />
                                                {partSearchQuery.trim().length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPartSearchQuery("")}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer"
                                                        title="Xóa tìm kiếm"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setIsPartModalOpen(true)}
                                                className="h-11 px-3 sm:px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm rounded-xl border border-blue-200 flex items-center gap-1 shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                                title="Thêm mới phụ tùng vào kho"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="hidden xs:inline sm:inline">Tạo mới</span>
                                            </button>
                                        </div>

                                        {/* Thanh lọc Danh mục nếu có nhiều hơn 1 danh mục */}
                                        {partCategories.length > 1 && (
                                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCategory("all")}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                                                        selectedCategory === "all"
                                                            ? "bg-blue-600 text-white font-semibold shadow-2xs"
                                                            : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                                                    }`}
                                                >
                                                    Tất cả
                                                </button>
                                                {partCategories.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                                                            selectedCategory === cat
                                                                ? "bg-blue-600 text-white font-semibold shadow-2xs"
                                                                : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                                                        }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* DANH SÁCH PHỤ TÙNG HIỆN SẴN DẠNG LƯỚI / CARD (KHÔNG POPUP, CHẠM LÀ CHỌN) */}
                                        <div className="max-h-56 sm:max-h-64 overflow-y-auto pr-1 rounded-xl border border-slate-100 p-2 bg-slate-50/50">
                                            {filteredWarehouseParts.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {filteredWarehouseParts.map((p) => {
                                                        const chosenQty = selectedItemMap.get(p.id) || 0;
                                                        const isChosen = chosenQty > 0;
                                                        const isOutOfStock = p.stock <= 0;

                                                        return (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => {
                                                                    if (isOutOfStock) return;
                                                                    addItem(p.id);
                                                                }}
                                                                className={`relative p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all select-none ${
                                                                    isOutOfStock
                                                                        ? "opacity-50 border-dashed border-slate-200 bg-slate-100/60 cursor-not-allowed"
                                                                        : isChosen
                                                                          ? "border-blue-500 bg-blue-50/70 shadow-2xs ring-1 ring-blue-500/20 cursor-pointer hover:bg-blue-50"
                                                                          : "border-slate-200/80 bg-white hover:border-blue-400 hover:bg-white shadow-2xs cursor-pointer"
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-1">
                                                                            {p.name}
                                                                        </div>
                                                                        {p.category && (
                                                                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                                                                {p.category}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        disabled={isOutOfStock}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (isOutOfStock) return;
                                                                            addItem(p.id);
                                                                        }}
                                                                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs transition-transform active:scale-90 ${
                                                                            isOutOfStock
                                                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                                                : isChosen
                                                                                  ? "bg-blue-600 text-white shadow-2xs hover:bg-blue-700"
                                                                                  : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                                                                        }`}
                                                                        title="Thêm phụ tùng vào phiếu"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100/80 text-[11px] font-mono">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span
                                                                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                                                                p.stock > 0
                                                                                    ? "bg-slate-200/70 text-slate-700"
                                                                                    : "bg-rose-100 text-rose-700"
                                                                            }`}
                                                                        >
                                                                            {p.stock > 0
                                                                                ? `Kho: ${p.stock}`
                                                                                : "Hết hàng"}
                                                                        </span>
                                                                        {p.warrantyMonths ? (
                                                                            <span className="text-[10px] text-slate-500 font-sans">
                                                                                BH: {p.warrantyMonths}T
                                                                            </span>
                                                                        ) : null}
                                                                    </div>

                                                                    {isChosen && (
                                                                        <span className="text-blue-700 font-sans font-bold text-[11px] inline-flex items-center gap-1">
                                                                            <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                                                                            Đã chọn ({chosenQty})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="py-6 px-4 text-center text-xs text-slate-500 space-y-2.5">
                                                    <p className="text-slate-600 font-medium">
                                                        Không tìm thấy phụ tùng phù hợp với &quot;{partSearchQuery}
                                                        &quot;
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsPartModalOpen(true)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Tạo mới phụ tùng vào kho
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* KHỐI 3: PHỤ TÙNG ĐÃ CHỌN VÀO PHIẾU */}
                                    <div className="space-y-3 p-3.5 sm:p-5 rounded-2xl bg-white border-2 border-blue-400 shadow-[0_4px_16px_-4px_rgba(37,99,235,0.1),0_1px_3px_rgba(15,23,42,0.04)]">
                                        <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-md bg-blue-600 text-white shadow-2xs">
                                                    <PackageCheck className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                                    Phụ tùng trong phiếu
                                                </span>
                                            </div>
                                            {selectedItems.length > 0 && (
                                                <span className="text-xs font-bold text-blue-700 bg-blue-100/90 border border-blue-300 px-2.5 py-0.5 rounded-full font-mono">
                                                    {selectedItems.reduce((sum, it) => sum + it.quantity, 0)} món
                                                </span>
                                            )}
                                        </div>

                                        {errors.items && (
                                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                                                <AlertCircle className="w-3 h-3 shrink-0 text-rose-500" />
                                                <span>{errors.items.message}</span>
                                            </div>
                                        )}

                                        {selectedItems.length > 0 ? (
                                            <div className="space-y-2.5">
                                                {selectedItems.map((item, idx) => {
                                                    const part = parts.find((p) => p.id === item.partId);
                                                    if (!part) return null;

                                                    const wMonths =
                                                        typeof item.warrantyMonths === "number"
                                                            ? item.warrantyMonths
                                                            : 12;
                                                    const itemActivatedOn =
                                                        item.activatedOn || activatedOn || todayVN();
                                                    const itemExpires =
                                                        wMonths > 0 ? addMonthsToDate(itemActivatedOn, wMonths) : null;
                                                    const isCustom =
                                                        customWarrantyIndexes.includes(idx) ||
                                                        !STANDARD_VALUES.includes(wMonths);

                                                    return (
                                                        <div
                                                            key={item.partId}
                                                            className="p-3 rounded-xl border border-slate-200/90 border-l-4 border-l-blue-600 bg-slate-50/50 space-y-2.5 shadow-2xs"
                                                        >
                                                            {/* Row 1: Tên phụ tùng + nút xóa */}
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                                                                        {part.name}
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                        <span className="text-[10px] text-slate-500 font-mono bg-slate-200/60 px-1.5 py-0.2 rounded">
                                                                            Kho: {part.stock}
                                                                        </span>
                                                                        {wMonths > 0 && itemExpires ? (
                                                                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 font-mono">
                                                                                {formatDateVN(itemActivatedOn)} →{" "}
                                                                                {formatDateVN(itemExpires)}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/70 px-1.5 py-0.2 rounded font-mono">
                                                                                {formatDateVN(itemActivatedOn)} (Không
                                                                                hạn)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(idx)}
                                                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                                                                    title="Bỏ phụ tùng này"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            {/* Row 2: Bộ chọn số lượng, Ngày kích hoạt riêng & Thời gian bảo hành */}
                                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                                                                {/* Stepper số lượng */}
                                                                <div className="flex items-center border border-slate-300/80 rounded-lg bg-white overflow-hidden shadow-2xs">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateItemQty(idx, item.quantity - 1)
                                                                        }
                                                                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 font-bold text-xs text-slate-700 transition-colors cursor-pointer"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-7 text-center text-xs font-mono font-bold text-slate-900 bg-slate-50 h-7 flex items-center justify-center border-x border-slate-200">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateItemQty(idx, item.quantity + 1)
                                                                        }
                                                                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 font-bold text-xs text-blue-600 transition-colors cursor-pointer"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>

                                                                {/* Ngày kích hoạt riêng cho món */}
                                                                <div className="flex items-center gap-1 w-28 shrink-0">
                                                                    <DatePicker
                                                                        size="sm"
                                                                        value={
                                                                            item.activatedOn || activatedOn || todayVN()
                                                                        }
                                                                        onChange={(dateStr) =>
                                                                            updateItemActivatedOn(idx, dateStr)
                                                                        }
                                                                        ariaLabel="Ngày kích hoạt riêng"
                                                                    />
                                                                </div>

                                                                {/* Dropdown bảo hành tiết kiệm không gian */}
                                                                <div className="flex items-center gap-1">
                                                                    <select
                                                                        value={isCustom ? -1 : wMonths}
                                                                        onChange={(e) => {
                                                                            const val = Number(e.target.value);
                                                                            if (val === -1) {
                                                                                setCustomWarrantyIndexes((prev) =>
                                                                                    prev.includes(idx)
                                                                                        ? prev
                                                                                        : [...prev, idx],
                                                                                );
                                                                            } else {
                                                                                setCustomWarrantyIndexes((prev) =>
                                                                                    prev.filter((i) => i !== idx),
                                                                                );
                                                                                updateItemWarranty(idx, val);
                                                                            }
                                                                        }}
                                                                        className="h-7 px-2 rounded-lg border border-slate-300/80 bg-white text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
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
                                                                                            parseInt(e.target.value) ||
                                                                                                0,
                                                                                        ),
                                                                                    )
                                                                                }
                                                                                placeholder="Tháng"
                                                                                className="w-12 h-7 px-1 text-center text-xs font-mono font-bold text-slate-900 bg-white border border-blue-500 rounded-lg focus:outline-none shadow-2xs"
                                                                            />
                                                                            <span className="text-[10px] text-slate-500 font-medium">
                                                                                th
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
                                            <div className="text-center py-6 px-3 text-xs text-slate-500 border border-dashed border-blue-200 rounded-xl bg-blue-50/30 space-y-1">
                                                <p className="font-semibold text-slate-700">
                                                    Chưa có phụ tùng nào trong phiếu
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    Bấm vào dropdown bên trên để chọn phụ tùng đưa vào phiếu
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                    {isSubmitting ? "Đang lưu…" : ticketId ? "Cập Nhật Phiếu" : "Kích Hoạt Bảo Hành"}
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

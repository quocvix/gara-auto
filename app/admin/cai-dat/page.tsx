"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGarageStore } from "@/lib/store/garage-store";
import {
    Save,
    RotateCcw,
    LogOut,
    Building,
    Phone,
    MapPin,
    Clock,
    AlertTriangle,
    ShieldCheck,
    Navigation,
    Check,
} from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/use-haptic";

export default function GarageSettingsPage() {
    const router = useRouter();
    const { settings, updateSettings, resetData, logoutAdmin } = useGarageStore();
    const { trigger } = useHaptic();

    const [name, setName] = useState(settings.name);
    const [hotline, setHotline] = useState(settings.hotline);
    const [address, setAddress] = useState(settings.address);
    const [mapsUrl, setMapsUrl] = useState(settings.mapsUrl);
    const [expiringThresholdDays, setExpiringThresholdDays] = useState(settings.expiringThresholdDays);
    const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isSaving) return;

        if (!name.trim()) {
            toast.error("Vui lòng nhập tên gara");
            trigger("error");
            return;
        }

        if (!hotline.trim()) {
            toast.error("Vui lòng nhập số hotline");
            trigger("error");
            return;
        }

        setIsSaving(true);
        trigger("tap");
        try {
            await updateSettings({
                name: name.trim(),
                hotline: hotline.trim(),
                address: address.trim(),
                mapsUrl: mapsUrl.trim(),
                expiringThresholdDays: Number(expiringThresholdDays) || 30,
                lowStockThreshold: Number(lowStockThreshold) || 3,
            });
            trigger("success");
            toast.success("Đã lưu cấu hình gara thành công!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetData = async () => {
        const ok = window.confirm(
            "Khôi phục dữ liệu demo ban đầu (4 xe mẫu, các phụ tùng và lịch sử mẫu)?\nMọi dữ liệu bạn vừa nhập thêm sẽ được làm mới.",
        );
        if (ok) {
            trigger("warning");
            await resetData();
            setName("Duy Auto");
            setHotline("0399950365");
            setAddress("Số 88 Đường Giải Phóng, Phường Giáp Bát, Hoàng Mai, Hà Nội");
            setMapsUrl("https://maps.google.com/?q=Duy+Auto");
            setExpiringThresholdDays(30);
            setLowStockThreshold(3);
            toast.success("Đã khôi phục dữ liệu mẫu ban đầu!");
        }
    };

    const handleLogout = () => {
        trigger("tap");
        logoutAdmin();
        toast.info("Đã đăng xuất khỏi tài khoản Quản trị");
        router.push("/login");
    };

    return (
        <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto pb-10 animate-in fade-in duration-200">
            {/* Top Header & Save Button */}
            <div className="flex flex-row items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Cài Đặt Hệ Thống</h1>
                </div>

                <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                    <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                    <span>{isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
                {/* Khối 1: Thông tin thương hiệu & liên hệ */}
                <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <Building className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                Thông Tin Thương Hiệu & Liên Hệ
                            </h2>
                            <p className="text-xs text-slate-500">Hiển thị công khai khi khách hàng tra cứu bảo hành</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Tên Gara / Trung Tâm Chăm Sóc Xe *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="VD: Duy Auto"
                                className="w-full h-11 px-3.5 rounded-xl border border-slate-200/90 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Số Điện Thoại Hotline *
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="tel"
                                    value={hotline}
                                    onChange={(e) => setHotline(e.target.value)}
                                    required
                                    placeholder="VD: 0399950365"
                                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200/90 bg-white font-mono font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Địa Chỉ Xưởng Dịch Vụ
                        </label>
                        <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="VD: Số 88 Đường Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội"
                                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200/90 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Link Google Maps Chỉ Đường
                        </label>
                        <div className="relative">
                            <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="url"
                                value={mapsUrl}
                                onChange={(e) => setMapsUrl(e.target.value)}
                                placeholder="https://maps.google.com/?q=..."
                                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200/90 bg-white font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Khối 2: Cấu hình ngưỡng cảnh báo xưởng */}
                <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                Cấu Hình Ngưỡng Cảnh Báo
                            </h2>
                            <p className="text-xs text-slate-500">
                                Quy định các mốc tự động đổi màu cảnh báo trên hệ thống
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Ngưỡng báo xe sắp hết hạn */}
                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Báo Xe Sắp Hết Hạn (Ngày)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="180"
                                value={expiringThresholdDays}
                                onChange={(e) => setExpiringThresholdDays(Number(e.target.value))}
                                required
                                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white font-mono font-black text-base text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
                            />
                            {/* Chip chọn mốc nhanh */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {[15, 30, 45, 60].map((days) => (
                                    <button
                                        key={days}
                                        type="button"
                                        onClick={() => {
                                            trigger("tap");
                                            setExpiringThresholdDays(days);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            Number(expiringThresholdDays) === days
                                                ? "bg-amber-600 text-white shadow-2xs"
                                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                        }`}
                                    >
                                        {days} ngày
                                    </button>
                                ))}
                            </div>
                            <span className="text-[11px] text-slate-500 block pt-0.5">
                                Xe còn dưới mốc này sẽ được gắn nhãn vàng &quot;Sắp hết hạn&quot;.
                            </span>
                        </div>

                        {/* Ngưỡng cảnh báo tồn kho thấp */}
                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Cảnh Báo Tồn Kho Thấp (Món)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={lowStockThreshold}
                                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                                required
                                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white font-mono font-black text-base text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition-all"
                            />
                            {/* Chip chọn mốc nhanh */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {[2, 3, 5, 10].map((qty) => (
                                    <button
                                        key={qty}
                                        type="button"
                                        onClick={() => {
                                            trigger("tap");
                                            setLowStockThreshold(qty);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            Number(lowStockThreshold) === qty
                                                ? "bg-rose-600 text-white shadow-2xs"
                                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                        }`}
                                    >
                                        ≤ {qty} món
                                    </button>
                                ))}
                            </div>
                            <span className="text-[11px] text-slate-500 block pt-0.5">
                                Phụ tùng có tồn kho ≤ mốc này sẽ hiện nhãn đỏ &quot;Sắp hết&quot;.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nút lưu ở chân form */}
                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                        <span>{isSaving ? "Đang lưu thay đổi..." : "Lưu Thay Đổi"}</span>
                    </button>
                </div>
            </form>

            {/* Khối Quản trị & Dữ liệu hệ thống */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                            Quản Trị & Dữ Liệu Hệ Thống
                        </h2>
                        <p className="text-xs text-slate-500">Phiên đăng nhập quản trị và khôi phục dữ liệu mẫu</p>
                    </div>
                </div>

                {/* Phiên làm việc */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                    <div>
                        <div className="font-bold text-sm text-slate-900">Phiên làm việc Quản trị</div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Tài khoản: chu-xuong@example.com</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng Xuất Admin</span>
                    </button>
                </div>

                {/* Khôi phục demo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
                    <div>
                        <div className="font-bold text-sm text-slate-900">Khôi phục dữ liệu mẫu ban đầu</div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Đặt lại toàn bộ xe, phiếu và phụ tùng về dữ liệu mặc định ban đầu
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetData}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all active:scale-95 cursor-pointer self-start sm:self-auto shadow-2xs"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Khôi Phục Dữ Liệu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

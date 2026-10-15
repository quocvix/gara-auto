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
import { useAlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GarageSettingsPage() {
    const router = useRouter();
    const { settings, updateSettings, resetData, logoutAdmin } = useGarageStore();
    const { trigger } = useHaptic();
    const { confirm } = useAlertDialog();

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
        const ok = await confirm({
            title: "Khôi phục dữ liệu mẫu?",
            description: (
                <div className="space-y-1.5">
                    <p>Hệ thống sẽ nạp lại 4 xe mẫu cùng toàn bộ phụ tùng và lịch sử ban đầu.</p>
                    <p className="text-rose-600 font-medium">Mọi dữ liệu bạn vừa nhập thêm sẽ bị hoàn tác về mặc định.</p>
                </div>
            ),
            variant: "danger",
            confirmText: "Khôi phục dữ liệu",
            cancelText: "Hủy bỏ",
        });
        if (ok) {
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
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
                            <Building className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle>Thông Tin Thương Hiệu & Liên Hệ</CardTitle>
                            <CardDescription>Hiển thị công khai khi khách hàng tra cứu bảo hành</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Tên Gara / Trung Tâm Chăm Sóc Xe *
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="VD: Duy Auto"
                                    className="font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Số Điện Thoại Hotline *
                                </label>
                                <Input
                                    type="tel"
                                    value={hotline}
                                    onChange={(e) => setHotline(e.target.value)}
                                    required
                                    placeholder="VD: 0399950365"
                                    leftIcon={<Phone className="w-4 h-4" />}
                                    className="font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Địa Chỉ Xưởng Dịch Vụ
                            </label>
                            <Input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="VD: Số 88 Đường Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội"
                                leftIcon={<MapPin className="w-4 h-4" />}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Link Google Maps Chỉ Đường
                            </label>
                            <Input
                                type="url"
                                value={mapsUrl}
                                onChange={(e) => setMapsUrl(e.target.value)}
                                placeholder="https://maps.google.com/?q=..."
                                leftIcon={<Navigation className="w-4 h-4" />}
                                className="font-mono text-xs"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Khối 2: Cấu hình ngưỡng cảnh báo xưởng */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 shrink-0">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle>Cấu Hình Ngưỡng Cảnh Báo</CardTitle>
                            <CardDescription>
                                Quy định các mốc tự động đổi màu cảnh báo trên hệ thống
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Ngưỡng báo xe sắp hết hạn */}
                            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Báo Xe Sắp Hết Hạn (Ngày)
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="180"
                                    value={expiringThresholdDays}
                                    onChange={(e) => setExpiringThresholdDays(Number(e.target.value))}
                                    required
                                    className="font-mono font-black text-base"
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
                                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {days} ngày
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-0.5">
                                    Xe còn dưới mốc này sẽ được gắn nhãn vàng &quot;Sắp hết hạn&quot;.
                                </span>
                            </div>

                            {/* Ngưỡng cảnh báo tồn kho thấp */}
                            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Cảnh Báo Tồn Kho Thấp (Món)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={lowStockThreshold}
                                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                                    required
                                    className="font-mono font-black text-base"
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
                                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            ≤ {qty} món
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-0.5">
                                    Phụ tùng có tồn kho ≤ mốc này sẽ hiện nhãn đỏ &quot;Sắp hết&quot;.
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Nút lưu ở chân form */}
                <div className="flex justify-end pt-1">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                        <span>{isSaving ? "Đang lưu thay đổi..." : "Lưu Thay Đổi"}</span>
                    </Button>
                </div>
            </form>

            {/* Khối Quản trị & Dữ liệu hệ thống */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <CardTitle>Quản Trị & Dữ Liệu Hệ Thống</CardTitle>
                        <CardDescription>Phiên đăng nhập quản trị và khôi phục dữ liệu mẫu</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3.5 pt-4">
                    {/* Phiên làm việc */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
                        <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Phiên làm việc Quản trị</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Tài khoản: chu-xuong@example.com</p>
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleLogout}
                            className="self-start sm:self-auto"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Đăng Xuất Admin</span>
                        </Button>
                    </div>

                    {/* Khôi phục demo */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
                        <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Khôi phục dữ liệu mẫu ban đầu</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Đặt lại toàn bộ xe, phiếu và phụ tùng về dữ liệu mặc định ban đầu
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetData}
                            className="self-start sm:self-auto"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span>Khôi Phục Dữ Liệu</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

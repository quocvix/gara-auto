"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListRow } from "@/components/ui/list-row";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/domain/status-badge";
import { LicensePlate } from "@/components/domain/license-plate";
import { WarrantyProgress } from "@/components/domain/warranty-progress";
import { useAlertDialog } from "@/components/ui/alert-dialog";
import {
    Wrench,
    Search,
    Car,
    Clock,
    ShieldCheck,
    AlertTriangle,
    Trash2,
    Edit3,
    ArrowLeft,
    Check,
    Plus,
    Calendar,
    Save,
} from "lucide-react";

export default function DesignSystemPage() {
    const { confirm } = useAlertDialog();
    const [demoInputVal, setDemoInputVal] = useState("30A-999.88");

    const handleTriggerDialog = async () => {
        await confirm({
            title: "Xác nhận xóa phiếu bảo hành?",
            description: (
                <div className="space-y-1">
                    <p>Phiếu bảo hành này sẽ bị hủy bỏ vĩnh viễn.</p>
                    <p className="text-rose-600 font-medium">Hành động này không thể hoàn tác.</p>
                </div>
            ),
            variant: "danger",
            confirmText: "Xác nhận xóa",
            cancelText: "Hủy bỏ",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600/15 selection:text-blue-700 pb-20">
            {/* Top Toolbar */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại Admin</span>
                    </Link>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                            <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900">
                            Duy Auto Design System
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Brand Locked v1.0
                    </span>
                </div>
            </header>

            {/* Main Container */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
                {/* 1. MÀU SẮC (Brand & Semantic Palette) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">1. Bảng Màu & Thương Hiệu (Brand Palette)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Hệ thống màu giữ nguyên 100% nhận diện Duy Auto: Royal Blue, Amber xưởng kỹ thuật và Slate trung tính chống mỏi mắt.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {/* Primary */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                            <div className="h-14 rounded-lg bg-[#1D4ED8] flex items-end p-2 text-white font-mono text-2xs font-bold shadow-xs">
                                #1D4ED8
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">Primary Blue</div>
                                <div className="text-2xs text-slate-500 font-mono">--primary</div>
                            </div>
                        </div>

                        {/* Brand / Amber */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                            <div className="h-14 rounded-lg bg-[#D97706] flex items-end p-2 text-white font-mono text-2xs font-bold shadow-xs">
                                #D97706
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">Brand Amber</div>
                                <div className="text-2xs text-slate-500 font-mono">--brand</div>
                            </div>
                        </div>

                        {/* Success */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                            <div className="h-14 rounded-lg bg-[#047857] flex items-end p-2 text-white font-mono text-2xs font-bold shadow-xs">
                                #047857
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">Success Green</div>
                                <div className="text-2xs text-slate-500 font-mono">--success</div>
                            </div>
                        </div>

                        {/* Danger / Destructive */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                            <div className="h-14 rounded-lg bg-[#B91C1C] flex items-end p-2 text-white font-mono text-2xs font-bold shadow-xs">
                                #B91C1C
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">Danger Red</div>
                                <div className="text-2xs text-slate-500 font-mono">--danger</div>
                            </div>
                        </div>

                        {/* Background */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                            <div className="h-14 rounded-lg bg-[#F8FAFC] border border-slate-200/80 flex items-end p-2 text-slate-700 font-mono text-2xs font-bold shadow-xs">
                                #F8FAFC
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">Slate Canvas</div>
                                <div className="text-2xs text-slate-500 font-mono">--background</div>
                            </div>
                        </div>

                        {/* Card Surface */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                            <div className="h-14 rounded-lg bg-[#FFFFFF] border border-slate-200 flex items-end p-2 text-slate-800 font-mono text-2xs font-bold shadow-xs">
                                #FFFFFF
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">Surface White</div>
                                <div className="text-2xs text-slate-500 font-mono">--card</div>
                            </div>
                        </div>
                    </div>

                    {/* Bảng tương phản WCAG */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                                    <th className="pb-2">Cặp Màu Chữ / Nền</th>
                                    <th className="pb-2">Mục Đích Dùng</th>
                                    <th className="pb-2 text-right">Tỉ Lệ Tương Phản (WCAG)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                <tr>
                                    <td className="py-2.5 text-slate-900 font-bold">Chữ #0F172A trên nền #F8FAFC</td>
                                    <td className="py-2.5 text-slate-500">Chữ chính nội dung bảng & trang</td>
                                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">14.9 : 1</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 text-slate-600 font-medium">Chữ #475569 trên nền #FFFFFF</td>
                                    <td className="py-2.5 text-slate-500">Chữ phụ, nhãn mô tả, ngày giờ</td>
                                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">5.9 : 1</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 text-white font-bold bg-[#1D4ED8] px-2 rounded">
                                        Chữ #FFFFFF trên nền #1D4ED8
                                    </td>
                                    <td className="py-2.5 text-slate-500">Nút bấm chính & CTA Lưu</td>
                                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">5.4 : 1</td>
                                </tr>
                                <tr>
                                    <td className="py-2.5 text-[#047857] font-semibold">Chữ #047857 trên nền #D1FAE5</td>
                                    <td className="py-2.5 text-slate-500">Huy hiệu Còn hạn bảo hành</td>
                                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">6.1 : 1</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 2. CHỮ & TYPOGRAPHY */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">2. Chữ & Phân Vai Kiểu Chữ (Typography Scale)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Phông chính: Plus Jakarta Sans (đầy đủ dấu tiếng Việt). Phông chuyên biệt biển số: Space Grotesk.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-3 gap-1">
                            <span className="text-2xs font-mono text-slate-400">text-2xl / font-black (24px)</span>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Hệ Thống Quản Lý Bảo Hành Ô Tô Duy Auto
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-3 gap-1">
                            <span className="text-2xs font-mono text-slate-400">text-lg / font-bold (18px)</span>
                            <div className="text-base sm:text-lg font-bold text-slate-900">
                                Danh Sách Phương Tiện Đang Thực Hiện Dịch Vụ
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-3 gap-1">
                            <span className="text-2xs font-mono text-slate-400">text-sm / font-semibold (14px)</span>
                            <div className="text-sm font-semibold text-slate-900">
                                Thay lốp Michelin Primacy 4 215/55R17 & cân mâm bấm chì
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-3 gap-1">
                            <span className="text-2xs font-mono text-slate-400">text-xs / font-medium (12px)</span>
                            <div className="text-xs font-medium text-slate-500">
                                Ngày kích hoạt: 15/10/2026 · Hạn bảo hành: 15/10/2028 · ODO: 45.000 km
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <span className="text-2xs font-mono text-slate-400">font-plate / uppercase (Space Grotesk)</span>
                            <div className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                                30A-999.88 · 51G-123.45 · 29B-456.78
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. NÚT BẤM (BUTTON) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">3. Nút Bấm (Button Primitives)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            4 biến thể chuẩn theo luật I1: Default (Primary), Secondary, Outline, Destructive. Đầy đủ các trạng thái tĩnh cạnh nhau.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Variant: Default */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-sm">Primary / Default</CardTitle>
                                <CardDescription>Thao tác chính (Lưu, Tạo phiếu)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-3.5">
                                <div className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Thường</span>
                                    <div>
                                        <Button className="w-full">
                                            <Save className="w-4 h-4" />
                                            <span>Lưu Thay Đổi</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="hover" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Rê chuột (Hover)</span>
                                    <div>
                                        <Button className="w-full bg-blue-700">
                                            <Save className="w-4 h-4" />
                                            <span>Lưu Thay Đổi</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="disabled" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Bị khóa (Disabled)</span>
                                    <div>
                                        <Button disabled className="w-full">
                                            <span>Lưu Thay Đổi</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variant: Outline */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-sm">Outline / Viền</CardTitle>
                                <CardDescription>Hành động phụ, lọc, hủy bỏ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-3.5">
                                <div className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Thường</span>
                                    <div>
                                        <Button variant="outline" className="w-full">
                                            <span>Hủy Bỏ</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="hover" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Rê chuột (Hover)</span>
                                    <div>
                                        <Button variant="outline" className="w-full bg-slate-50">
                                            <span>Hủy Bỏ</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="disabled" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Bị khóa (Disabled)</span>
                                    <div>
                                        <Button variant="outline" disabled className="w-full">
                                            <span>Hủy Bỏ</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variant: Destructive */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-sm">Destructive / Xóa</CardTitle>
                                <CardDescription>Hành động nguy hiểm, xóa xe</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-3.5">
                                <div className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Thường</span>
                                    <div>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Xóa Hồ Sơ</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="hover" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Rê chuột (Hover)</span>
                                    <div>
                                        <Button variant="destructive" className="w-full bg-rose-700">
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Xóa Hồ Sơ</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="disabled" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Bị khóa (Disabled)</span>
                                    <div>
                                        <Button variant="destructive" disabled className="w-full">
                                            <span>Xóa Hồ Sơ</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variant: Secondary */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-sm">Secondary / Nền nhẹ</CardTitle>
                                <CardDescription>Chức năng xem thêm, quản trị</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-3.5">
                                <div className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Thường</span>
                                    <div>
                                        <Button variant="secondary" className="w-full">
                                            <span>Xem Chi Tiết</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="hover" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Rê chuột (Hover)</span>
                                    <div>
                                        <Button variant="secondary" className="w-full bg-slate-200">
                                            <span>Xem Chi Tiết</span>
                                        </Button>
                                    </div>
                                </div>
                                <div inert data-demo-state="disabled" className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium">Bị khóa (Disabled)</span>
                                    <div>
                                        <Button variant="secondary" disabled className="w-full">
                                            <span>Xem Chi Tiết</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 4. Ô NHẬP LIỆU (INPUT) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">4. Ô Nhập Liệu (Input Fields)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Chiều cao h-10 chuẩn mực, bo góc r=12px, nền trắng surface, focus-ring xanh êm ái.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200">
                            <span className="text-2xs text-slate-400 font-medium">Thường (Default)</span>
                            <Input
                                value={demoInputVal}
                                onChange={(e) => setDemoInputVal(e.target.value)}
                                placeholder="Nhập biển số xe..."
                            />
                        </div>

                        <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200">
                            <span className="text-2xs text-slate-400 font-medium">Có biểu tượng trái (Icon Left)</span>
                            <Input
                                defaultValue="Toyota Camry 2.5Q"
                                leftIcon={<Car className="w-4 h-4" />}
                                placeholder="Tên dòng xe..."
                            />
                        </div>

                        <div inert data-demo-state="error" className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200">
                            <span className="text-2xs text-slate-400 font-medium">Báo lỗi (Validation Error)</span>
                            <Input
                                defaultValue="0999"
                                error="Số điện thoại chưa đủ 10 chữ số"
                            />
                        </div>

                        <div inert data-demo-state="disabled" className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200">
                            <span className="text-2xs text-slate-400 font-medium">Bị khóa (Disabled)</span>
                            <Input
                                disabled
                                defaultValue="Dữ liệu chỉ xem"
                            />
                        </div>
                    </div>
                </section>

                {/* 5. HUY HIỆU & TRẠNG THÁI (STATUS BADGES) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">5. Trạng Thái & Huy Hiệu (Badges & Domain Status)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Ánh xạ trạng thái D2 chuẩn: 3 mốc bảo hành chính + biến thể tổng quát.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center gap-4">
                        <div className="space-y-1 text-center">
                            <span className="text-2xs text-slate-400 block">Còn hạn</span>
                            <StatusBadge status="active" days={180} showDays />
                        </div>

                        <div className="space-y-1 text-center">
                            <span className="text-2xs text-slate-400 block">Sắp hết hạn</span>
                            <StatusBadge status="expiring" days={14} />
                        </div>

                        <div className="space-y-1 text-center">
                            <span className="text-2xs text-slate-400 block">Hết hạn</span>
                            <StatusBadge status="expired" />
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-2" />

                        <div className="space-y-1 text-center">
                            <span className="text-2xs text-slate-400 block">Default Pill</span>
                            <Badge variant="default">Chính Hãng</Badge>
                        </div>

                        <div className="space-y-1 text-center">
                            <span className="text-2xs text-slate-400 block">Secondary</span>
                            <Badge variant="secondary">Lịch sử kho</Badge>
                        </div>

                        <div className="space-y-1 text-center">
                            <span className="text-2xs text-slate-400 block">Warning</span>
                            <Badge variant="warning">Tồn kho thấp</Badge>
                        </div>

                        <div className="space-y-1 text-center">
                            <span className="text-2xs text-slate-400 block">Destructive</span>
                            <Badge variant="destructive">Ngưng dùng</Badge>
                        </div>
                    </div>
                </section>

                {/* 6. DÒNG DANH SÁCH (LIST ROW) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">6. Dòng Danh Sách (ListRow Component)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Tuân thủ 3 tầng ưu tiên: Trái là icon định dạng, giữa là thông tin co giãn min-w-0 truncate, phải là nút thao tác.
                        </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200">
                        <ul className="divide-y divide-slate-100">
                            <ListRow
                                leftIcon={
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                        <Car className="w-4 h-4" />
                                    </div>
                                }
                                title="Toyota Camry 2.5Q — 30A-999.88"
                                subtitle="Chủ xe: Nguyễn Văn An · 0912 345 678 · Bảo dưỡng lần cuối 12/10/2026"
                                badge={<StatusBadge status="active" days={320} />}
                                rightAction={
                                    <Button variant="outline" size="sm" className="h-8 px-2.5">
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Sửa</span>
                                    </Button>
                                }
                            />

                            <ListRow
                                leftIcon={
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                        <Wrench className="w-4 h-4" />
                                    </div>
                                }
                                title="Mazda CX-5 2.0 Premium — 51G-123.45"
                                subtitle="Chủ xe: Trần Thị Bích · 0988 776 655 · Phụ tùng: Lọc gió điều hòa Denso"
                                badge={<StatusBadge status="expiring" days={7} />}
                                rightAction={
                                    <Button variant="outline" size="sm" className="h-8 px-2.5">
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Gia hạn</span>
                                    </Button>
                                }
                            />

                            <ListRow
                                leftIcon={
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                }
                                title="Ford Ranger Wildtrak 3.2L — 29C-888.66"
                                subtitle="Chủ xe: Lê Hoàng Nam · 0903 112 233 · Hết hạn 30 ngày trước"
                                badge={<StatusBadge status="expired" />}
                                rightAction={
                                    <Button variant="secondary" size="sm" className="h-8 px-2.5">
                                        <span>Xem</span>
                                    </Button>
                                }
                            />
                        </ul>
                    </div>
                </section>

                {/* 7. NGUYÊN TỐ ĐẶC THÙ DUY AUTO (BIỂN SỐ XE & TIẾN ĐỘ BẢO HÀNH) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">7. Nhận Diện Ô Tô Đặc Trưng (Automotive Domain)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Biển số xe ô tô tiêu chuẩn Việt Nam (biển trắng dân sự, biển vàng kinh doanh vận tải) & tiến độ hạn bảo hành.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-sm">Biển Số Xe Chuẩn Việt Nam</CardTitle>
                                <CardDescription>Font Space Grotesk, 4 đinh vít góc, dập nổi 3D nhẹ</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="space-y-1">
                                        <span className="text-2xs text-slate-400 font-medium block">Biển trắng (Cá nhân)</span>
                                        <LicensePlate plate="30A-999.88" color="white" size="md" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-2xs text-slate-400 font-medium block">Biển vàng (Kinh doanh)</span>
                                        <LicensePlate plate="51G-123.45" color="yellow" size="md" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium block">Kích cỡ nhỏ (Mobile list)</span>
                                    <LicensePlate plate="29B-456.78" color="white" size="sm" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-sm">Thanh Tiến Độ Bảo Hành</CardTitle>
                                <CardDescription>Tự động đổi màu theo % thời gian còn lại</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium block">Còn hạn dài (Xanh emerald)</span>
                                    <WarrantyProgress activatedOn="2026-01-01" expiresOn="2027-01-01" status="active" daysLeft={78} />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-2xs text-slate-400 font-medium block">Sắp hết hạn (Vàng hổ phách)</span>
                                    <WarrantyProgress activatedOn="2024-10-15" expiresOn="2026-10-25" status="expiring" daysLeft={10} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 8. TRẠNG THÁI RỖNG & LỖI (EMPTY STATE & ERROR) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">8. Trạng Thái Rỗng & Lỗi Tải (Empty & Error States)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Thiết kế gọn gàng đúng 1 dòng mờ, không hình vẽ to đùng. Có lối ra tức thì cho người dùng.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2 border-b border-slate-100">
                                <CardTitle className="text-sm">Rỗng Do Tìm Kiếm / Lọc</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <EmptyState
                                    message="Không tìm thấy phương tiện nào khớp biển số &ldquo;99Z-999.99&rdquo;."
                                    onClear={() => alert("Đã xóa tìm kiếm")}
                                    clearLabel="Xóa tìm kiếm"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2 border-b border-slate-100">
                                <CardTitle className="text-sm">Lỗi Tải Dữ Liệu (2 Tầng)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <ErrorState
                                    title="Không thể tải lịch sử bảo dưỡng"
                                    description="Kết nối mạng không ổn định hoặc phiên làm việc đã hết hạn"
                                    onRetry={() => alert("Đang thử lại...")}
                                    retryLabel="Thử lại kết nối"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 9. HỘP THOẠI XÁC NHẬN (ALERT DIALOG) */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 pb-2.5">
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">9. Hộp Thoại Xác Nhận (AlertDialog Modal)</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Thay thế hoàn toàn window.confirm bằng dialog native React 19 có haptic feedback và bẫy phím ESC.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <div className="text-sm font-bold text-slate-900">Kiểm tra Modal Xác Nhận Xóa</div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Bấm nút bên cạnh để mở thử hộp thoại cảnh báo rủi ro cao (danger variant).
                            </p>
                        </div>

                        <Button variant="destructive" onClick={handleTriggerDialog} className="shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Mở AlertDialog Thử Nghiệm</span>
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
}

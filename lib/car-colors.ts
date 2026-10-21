export interface CarColorConfig {
    name: string;
    hex: string;
    border?: string;
    textColor?: string;
}

export const POPULAR_CAR_COLORS: CarColorConfig[] = [
    { name: "Trắng", hex: "#FFFFFF", border: "#CBD5E1", textColor: "#0F172A" },
    { name: "Đen", hex: "#0F172A", textColor: "#FFFFFF" },
    { name: "Bạc", hex: "#E2E8F0", border: "#94A3B8", textColor: "#0F172A" },
    { name: "Xám", hex: "#64748B", textColor: "#FFFFFF" },
    { name: "Đỏ", hex: "#DC2626", textColor: "#FFFFFF" },
    { name: "Xanh dương", hex: "#2563EB", textColor: "#FFFFFF" },
    { name: "Nâu", hex: "#78350F", textColor: "#FFFFFF" },
    { name: "Vàng cát", hex: "#CA8A04", textColor: "#FFFFFF" },
    { name: "Cam", hex: "#EA580C", textColor: "#FFFFFF" },
    { name: "Xanh lá", hex: "#16A34A", textColor: "#FFFFFF" },
];

export function getCarColorConfig(colorVal?: string): CarColorConfig | null {
    if (!colorVal || !colorVal.trim()) return null;
    const clean = colorVal.trim().toLowerCase();

    // 1. Tìm theo tên tiếng Việt
    const foundByName = POPULAR_CAR_COLORS.find(
        (c) => c.name.toLowerCase() === clean
    );
    if (foundByName) return foundByName;

    // 2. Tìm theo mã HEX có sẵn trong palette
    const foundByHex = POPULAR_CAR_COLORS.find(
        (c) => c.hex.toLowerCase() === clean
    );
    if (foundByHex) return foundByHex;

    // 3. Nếu là mã HEX tùy chỉnh (#RGB hoặc #RRGGBB)
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorVal.trim())) {
        const hex = colorVal.trim().toUpperCase();
        const isLight = isLightColor(hex);
        return {
            name: hex,
            hex: hex,
            border: isLight ? "#CBD5E1" : undefined,
            textColor: isLight ? "#0F172A" : "#FFFFFF",
        };
    }

    // 4. Fallback cho tên màu khác
    return {
        name: colorVal.trim(),
        hex: "#64748B",
        textColor: "#FFFFFF",
    };
}

function isLightColor(hex: string): boolean {
    const c = hex.replace("#", "");
    const fullHex = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    const r = parseInt(fullHex.substring(0, 2), 16) || 0;
    const g = parseInt(fullHex.substring(2, 4), 16) || 0;
    const b = parseInt(fullHex.substring(4, 6), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
}


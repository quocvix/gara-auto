-- ==============================================================================
-- DUY AUTO - SUPABASE POSTGRESQL SCHEMA MIGRATION (OPTIMIZED)
-- Tối ưu hóa theo chuẩn Supabase Postgres Best Practices:
-- - Loại bỏ các cột không sử dụng (sku, price, odo, part_sku, serial)
-- - Loại bỏ index thừa (idx_parts_sku) giảm dung lượng và overhead ghi
-- - Bổ sung index cho foreign key (ticket_items.part_id, stock_movements.ticket_id)
-- - Tối ưu hóa biểu thức RLS Policies cho authenticated users
-- ==============================================================================

-- 1. Bảng Cài đặt Gara (garage_settings)
CREATE TABLE IF NOT EXISTS garage_settings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Duy Auto',
    hotline TEXT NOT NULL DEFAULT '0901234567',
    address TEXT NOT NULL DEFAULT '123 Đường Số 7, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
    maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=Duy+Auto',
    expiring_threshold_days INT NOT NULL DEFAULT 30,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Xe ô tô (vehicles)
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    plate TEXT NOT NULL,
    plate_normalized TEXT NOT NULL,
    plate_color TEXT NOT NULL DEFAULT 'white' CHECK (plate_color IN ('white', 'yellow')),
    model TEXT NOT NULL,
    owner_name TEXT NOT NULL DEFAULT '',
    owner_phone TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate_normalized ON vehicles(plate_normalized);

-- 3. Bảng Phụ tùng / Linh kiện kho (parts)
CREATE TABLE IF NOT EXISTS parts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Khác',
    warranty_months INT NOT NULL DEFAULT 12,
    stock INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_is_active ON parts(is_active);

-- 4. Bảng Phiếu Bảo Hành (warranty_tickets)
CREATE TABLE IF NOT EXISTS warranty_tickets (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    activated_on DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_on DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_vehicle_id ON warranty_tickets(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tickets_expires_on ON warranty_tickets(expires_on);

-- 5. Bảng Chi tiết Hạng mục Bảo hành (ticket_items)
CREATE TABLE IF NOT EXISTS ticket_items (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES warranty_tickets(id) ON DELETE CASCADE,
    part_id TEXT REFERENCES parts(id) ON DELETE SET NULL,
    part_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    warranty_months INT NOT NULL DEFAULT 12,
    expires_on DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_items_ticket_id ON ticket_items(ticket_id);
-- Bổ sung index cho FK part_id (schema-foreign-key-indexes best practice)
CREATE INDEX IF NOT EXISTS idx_ticket_items_part_id ON ticket_items(part_id);

-- 6. Bảng Lịch sử Biến động Tồn kho (stock_movements)
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGSERIAL PRIMARY KEY,
    part_id TEXT NOT NULL,
    part_name TEXT NOT NULL,
    delta INT NOT NULL,
    stock_after INT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('initial', 'import', 'export', 'adjust', 'ticket_use', 'ticket_revert')),
    ticket_id TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movements_part_id ON stock_movements(part_id);
CREATE INDEX IF NOT EXISTS idx_movements_ticket_id ON stock_movements(ticket_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON stock_movements(created_at DESC);

-- 7. Seed dữ liệu cài đặt mặc định
INSERT INTO garage_settings (id, name, hotline, address, maps_url, expiring_threshold_days, low_stock_threshold)
VALUES (1, 'Duy Auto', '0901234567', '123 Đường Số 7, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh', 'https://maps.google.com/?q=Duy+Auto', 30, 5)
ON CONFLICT (id) DO NOTHING;

-- 8. Row Level Security (RLS)
ALTER TABLE garage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Khách vãng lai được phép tra cứu thông tin xe & phiếu bảo hành (tối ưu TO anon)
CREATE POLICY "Public read vehicles for warranty lookup" ON vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Public read warranty tickets" ON warranty_tickets FOR SELECT TO anon USING (true);
CREATE POLICY "Public read ticket items" ON ticket_items FOR SELECT TO anon USING (true);
CREATE POLICY "Public read settings" ON garage_settings FOR SELECT TO anon USING (true);

-- Authenticated Users (Admin) được toàn quyền CRUD (tối ưu hóa per security-rls-performance)
CREATE POLICY "Admin full access vehicles" ON vehicles FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access tickets" ON warranty_tickets FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access ticket items" ON ticket_items FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access parts" ON parts FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access movements" ON stock_movements FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access settings" ON garage_settings FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

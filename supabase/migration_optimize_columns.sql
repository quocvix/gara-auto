-- ==============================================================================
-- MIGRATION: TỐI ƯU CÁC CỘT KHÔNG SỬ DỤNG THEO SUPABASE POSTGRES BEST PRACTICES
-- Chạy script này trên Supabase SQL Editor cho cơ sở dữ liệu đang chạy
-- ==============================================================================

-- 1. Bảng vehicles: Bỏ cột odo
ALTER TABLE vehicles DROP COLUMN IF EXISTS odo;

-- 2. Bảng parts: Bỏ index và các cột sku, price
DROP INDEX IF EXISTS idx_parts_sku;
ALTER TABLE parts DROP COLUMN IF EXISTS sku;
ALTER TABLE parts DROP COLUMN IF EXISTS price;

-- 3. Bảng warranty_tickets: Bỏ cột odo
ALTER TABLE warranty_tickets DROP COLUMN IF EXISTS odo;

-- 4. Bảng ticket_items: Bỏ part_sku, serial và bổ sung index cho foreign key part_id
ALTER TABLE ticket_items DROP COLUMN IF EXISTS part_sku;
ALTER TABLE ticket_items DROP COLUMN IF EXISTS serial;
CREATE INDEX IF NOT EXISTS idx_ticket_items_part_id ON ticket_items(part_id);

-- 5. Bảng stock_movements: Bỏ part_sku và bổ sung index cho ticket_id
ALTER TABLE stock_movements DROP COLUMN IF EXISTS part_sku;
CREATE INDEX IF NOT EXISTS idx_movements_ticket_id ON stock_movements(ticket_id);

-- 6. Tối ưu RLS Policies cho authenticated users (giảm overhead gọi per-row)
DROP POLICY IF EXISTS "Admin full access vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin full access tickets" ON warranty_tickets;
DROP POLICY IF EXISTS "Admin full access ticket items" ON ticket_items;
DROP POLICY IF EXISTS "Admin full access parts" ON parts;
DROP POLICY IF EXISTS "Admin full access movements" ON stock_movements;
DROP POLICY IF EXISTS "Admin full access settings" ON garage_settings;

CREATE POLICY "Admin full access vehicles" ON vehicles FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access tickets" ON warranty_tickets FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access ticket items" ON ticket_items FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access parts" ON parts FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access movements" ON stock_movements FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "Admin full access settings" ON garage_settings FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

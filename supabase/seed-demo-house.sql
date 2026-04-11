-- ============================================================
-- HomeBase OS — Demo House Seed Data
-- Run this AFTER schema.sql, in the Supabase SQL Editor
--
-- This creates a demo property for a given user.
-- Replace YOUR_USER_ID_HERE with your actual auth user UUID
-- (find it in Supabase Dashboard > Authentication > Users)
-- ============================================================

-- Step 1: Set your user ID here
-- After signing up, go to Supabase Dashboard > Authentication > Users
-- Copy your user's UUID and paste it below:
DO $$
DECLARE
  v_user_id uuid := 'YOUR_USER_ID_HERE'; -- ← REPLACE THIS
  v_property_id uuid;
  v_kitchen_id uuid;
  v_master_bed_id uuid;
  v_living_id uuid;
  v_garage_id uuid;
  v_master_bath_id uuid;
  v_laundry_id uuid;
BEGIN

-- ─── Property ──────────────────────────────────────────────
INSERT INTO properties (id, user_id, name, address, city, state, zip, year_built, sqft, lot_size, stories, bedrooms, bathrooms, is_active, onboarding_complete)
VALUES (gen_random_uuid(), v_user_id, 'Demo Home', '742 Evergreen Terrace', 'Springfield', 'IL', '62704', '1998', '2400', '0.25 acres', '2', '4', '2.5', true, true)
RETURNING id INTO v_property_id;

-- ─── Rooms ─────────────────────────────────────────────────
INSERT INTO rooms (id, property_id, name, type, floor, notes)
VALUES (gen_random_uuid(), v_property_id, 'Kitchen', 'kitchen', '1', 'Updated 2019 with granite countertops')
RETURNING id INTO v_kitchen_id;

INSERT INTO rooms (id, property_id, name, type, floor, notes)
VALUES (gen_random_uuid(), v_property_id, 'Master Bedroom', 'bedroom', '2', 'Walk-in closet, ceiling fan')
RETURNING id INTO v_master_bed_id;

INSERT INTO rooms (id, property_id, name, type, floor, notes)
VALUES (gen_random_uuid(), v_property_id, 'Living Room', 'living', '1', 'Hardwood floors, fireplace')
RETURNING id INTO v_living_id;

INSERT INTO rooms (id, property_id, name, type, floor, notes)
VALUES (gen_random_uuid(), v_property_id, 'Garage', 'garage', '1', '2-car attached garage')
RETURNING id INTO v_garage_id;

INSERT INTO rooms (id, property_id, name, type, floor, notes)
VALUES (gen_random_uuid(), v_property_id, 'Master Bathroom', 'bathroom', '2', 'Double vanity, walk-in shower')
RETURNING id INTO v_master_bath_id;

INSERT INTO rooms (id, property_id, name, type, floor, notes)
VALUES (gen_random_uuid(), v_property_id, 'Laundry Room', 'utility', '1', 'Off the kitchen')
RETURNING id INTO v_laundry_id;

-- ─── Appliances ────────────────────────────────────────────
INSERT INTO appliances (property_id, room_id, name, type, brand, model, install_date, warranty_expiry, notes) VALUES
(v_property_id, v_kitchen_id, 'Refrigerator', 'refrigerator', 'Samsung', 'RF28R7351SR', '2021-03-15', '2026-03-15', 'French door, ice maker'),
(v_property_id, v_kitchen_id, 'Dishwasher', 'dishwasher', 'Bosch', 'SHPM88Z75N', '2021-03-15', '2024-03-15', 'Quiet operation'),
(v_property_id, v_kitchen_id, 'Range/Oven', 'oven', 'GE Profile', 'PGS930', '2019-06-01', '2024-06-01', 'Gas range, double oven'),
(v_property_id, v_kitchen_id, 'Microwave', 'microwave', 'GE Profile', 'PVM9005', '2019-06-01', '2024-06-01', 'Over-the-range'),
(v_property_id, v_laundry_id, 'Washer', 'washer', 'LG', 'WM4000HWA', '2022-01-10', '2025-01-10', 'Front load, steam'),
(v_property_id, v_laundry_id, 'Dryer', 'dryer', 'LG', 'DLEX4000W', '2022-01-10', '2025-01-10', 'Electric, sensor dry'),
(v_property_id, v_garage_id, 'Garage Door Opener', 'garage_door', 'Chamberlain', 'B6765', '2020-05-20', '2025-05-20', 'WiFi connected, battery backup');

-- ─── Systems ───────────────────────────────────────────────
INSERT INTO systems (property_id, type, data) VALUES
(v_property_id, 'hvac', '{"brand": "Carrier", "model": "24ACC636A003", "type": "Central AC + Gas Furnace", "installDate": "2018-04-01", "lastService": "2025-10-15", "filterSize": "20x25x4", "notes": "Serviced annually by Cool Air Pros"}'::jsonb),
(v_property_id, 'water_heater', '{"brand": "Rheem", "model": "PROG50-38N", "type": "Tank - 50 gallon", "fuelType": "Natural Gas", "installDate": "2020-08-01", "notes": "In garage, drain annually"}'::jsonb),
(v_property_id, 'electrical', '{"panelLocation": "Garage - east wall", "amperage": "200A", "mainBreaker": "Yes", "notes": "Panel upgraded 2015, labeled"}'::jsonb),
(v_property_id, 'plumbing', '{"mainShutoff": "Front yard, left of driveway", "pipeType": "Copper + PEX (repiped 2015)", "sewerType": "Municipal", "notes": "Sewer cleanout behind garage"}'::jsonb);

-- ─── Paint Records ─────────────────────────────────────────
INSERT INTO paint_records (property_id, room_name, color_name, color_hex, brand, finish, date_painted) VALUES
(v_property_id, 'Living Room', 'Agreeable Gray', '#D0CBC2', 'Sherwin-Williams', 'eggshell', '2023-06-01'),
(v_property_id, 'Master Bedroom', 'Sea Salt', '#C3D5CD', 'Sherwin-Williams', 'eggshell', '2023-06-01'),
(v_property_id, 'Kitchen', 'Simply White', '#F1EDE4', 'Benjamin Moore', 'satin', '2019-06-01'),
(v_property_id, 'Master Bathroom', 'Silver Chain', '#C7C9C7', 'Benjamin Moore', 'semi-gloss', '2023-06-01');

-- ─── Smart Home ────────────────────────────────────────────
INSERT INTO smart_home (property_id, type, data) VALUES
(v_property_id, 'wifi', '{"networkName": "HomeBase_5G", "router": "Google Nest WiFi Pro", "isp": "Comcast Xfinity", "speed": "600 Mbps", "password": "ask-the-owner"}'::jsonb),
(v_property_id, 'door_lock', '{"brand": "Schlage", "model": "Encode Plus", "location": "Front door", "code": "Change after sharing"}'::jsonb),
(v_property_id, 'security', '{"provider": "Ring", "hasCamera": true, "locations": "Front door, backyard, garage", "monitoring": "Self-monitored"}'::jsonb),
(v_property_id, 'garage', '{"brand": "Chamberlain", "app": "myQ", "notes": "WiFi connected, battery backup"}'::jsonb);

-- ─── Emergency Info ────────────────────────────────────────
INSERT INTO emergency_info (property_id, type, data) VALUES
(v_property_id, 'water_shutoff', '{"location": "Front yard, near sidewalk - blue cap", "type": "Gate valve", "notes": "Need water key to turn"}'::jsonb),
(v_property_id, 'gas_shutoff', '{"location": "Left side of house, near meter", "type": "Ball valve", "notes": "Use adjustable wrench, quarter turn"}'::jsonb),
(v_property_id, 'electrical_panel', '{"location": "Garage - east wall", "notes": "200A panel, all breakers labeled"}'::jsonb);

-- ─── Exterior ──────────────────────────────────────────────
INSERT INTO exterior (property_id, type, data) VALUES
(v_property_id, 'roof', '{"material": "Architectural Shingles", "brand": "GAF Timberline HDZ", "color": "Charcoal", "installDate": "2018-05-01", "warrantyYears": 30, "contractor": "ABC Roofing", "notes": "Inspected 2024, good condition"}'::jsonb),
(v_property_id, 'gutters', '{"material": "Aluminum", "guards": "LeafFilter installed 2022", "notes": "Clean annually anyway"}'::jsonb),
(v_property_id, 'siding', '{"material": "Fiber Cement (HardiePlank)", "color": "Cobblestone", "installDate": "2015-01-01", "notes": "Painted, inspect caulking annually"}'::jsonb);

-- ─── Contacts ──────────────────────────────────────────────
INSERT INTO contacts (property_id, name, company, role, phone, email, notes, rating, is_favorite) VALUES
(v_property_id, 'Mike Johnson', 'Cool Air Pros', 'hvac', '555-0101', 'mike@coolairpros.com', 'Annual HVAC service contract', 5, true),
(v_property_id, 'Sarah Chen', 'Reliable Plumbing', 'plumber', '555-0102', 'sarah@reliableplumbing.com', 'Fixed water heater 2020, great work', 4, true),
(v_property_id, 'Tom Rivera', 'Rivera Electric', 'electrician', '555-0103', 'tom@riveraelectric.com', 'Panel upgrade 2015', 5, false),
(v_property_id, 'Lisa Park', 'Park Painting', 'painter', '555-0104', 'lisa@parkpainting.com', 'Interior repaint 2023', 4, false);

-- ─── Utilities ─────────────────────────────────────────────
INSERT INTO utilities (property_id, type, provider, account_number, phone, website, notes) VALUES
(v_property_id, 'electric', 'Ameren Illinois', 'ACCT-12345', '800-755-5000', 'ameren.com', 'Budget billing enrolled'),
(v_property_id, 'gas', 'Ameren Illinois', 'ACCT-12345', '800-755-5000', 'ameren.com', 'Same account as electric'),
(v_property_id, 'water', 'City Water Dept', 'WTR-67890', '555-555-0100', 'springfield.gov/water', 'Bill every 2 months'),
(v_property_id, 'internet', 'Comcast Xfinity', 'XF-11111', '800-934-6489', 'xfinity.com', '600 Mbps plan');

-- ─── Sample Energy Bills ───────────────────────────────────
INSERT INTO energy_bills (property_id, utility_type, billing_period_start, billing_period_end, amount_dollars, usage_amount, usage_unit, source) VALUES
(v_property_id, 'electric', '2025-01-01', '2025-01-31', 145.00, 1050, 'kWh', 'manual'),
(v_property_id, 'electric', '2025-02-01', '2025-02-28', 138.00, 980, 'kWh', 'manual'),
(v_property_id, 'electric', '2025-03-01', '2025-03-31', 125.00, 890, 'kWh', 'manual'),
(v_property_id, 'gas', '2025-01-01', '2025-01-31', 95.00, 85, 'therms', 'manual'),
(v_property_id, 'gas', '2025-02-01', '2025-02-28', 82.00, 72, 'therms', 'manual'),
(v_property_id, 'gas', '2025-03-01', '2025-03-31', 55.00, 45, 'therms', 'manual'),
(v_property_id, 'water', '2025-01-01', '2025-02-28', 65.00, 8500, 'gallons', 'manual'),
(v_property_id, 'water', '2025-03-01', '2025-04-30', 72.00, 9200, 'gallons', 'manual');

RAISE NOTICE 'Demo house created! Property ID: %', v_property_id;

END $$;

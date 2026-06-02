-- 1. Create Tables
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE markets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE commodities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  price DECIMAL NOT NULL,
  trader_id TEXT, -- References Supabase Auth ID
  date_submitted TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 1. Users Profile Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'buyer',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Farmgate Prices Table
CREATE TABLE farmgate_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity_id UUID REFERENCES commodities(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  farm_gate_price DECIMAL NOT NULL,
  transport_cost DECIMAL DEFAULT 0,
  date_submitted TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 3. Create Public Access Policies (Everyone can read)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Markets" ON markets FOR SELECT USING (true);
CREATE POLICY "Public Read Commodities" ON commodities FOR SELECT USING (true);
CREATE POLICY "Public Read Prices" ON prices FOR SELECT USING (true);

-- 4. Create Service Role Policies (Allow all for setup/admin)
CREATE POLICY "Admin All Categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admin All Markets" ON markets FOR ALL USING (true);
CREATE POLICY "Admin All Commodities" ON commodities FOR ALL USING (true);
CREATE POLICY "Admin All Prices" ON prices FOR ALL USING (true);
CREATE POLICY "Admin All Activities" ON activities FOR ALL USING (true);

-- --- Enable Row Level Security (RLS) for new tables ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmgate_prices ENABLE ROW LEVEL SECURITY;

-- --- Basic Policies ---

-- Profiles: Users can read all, but only edit their own
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Notifications: Users can only see their own
CREATE POLICY "Users Read Own Notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- Farmgate Prices: Everyone can read
CREATE POLICY "Public Read Farmgate" ON farmgate_prices FOR SELECT USING (true);
CREATE POLICY "Admin All Farmgate" ON farmgate_prices FOR ALL USING (true);

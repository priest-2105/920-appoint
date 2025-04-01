-- Create tables for our hairstyle booking platform

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create a table for users/customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for hairstyles
CREATE TABLE hairstyles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- Duration in minutes
  category TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  hairstyle_id UUID REFERENCES hairstyles(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  payment_id TEXT, -- Reference to payment in PayPal
  payment_status TEXT, -- pending, completed, refunded
  payment_amount DECIMAL(10, 2),
  google_calendar_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for available time slots
CREATE TABLE available_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for blocked dates (holidays, vacations, etc.)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Customers can view their own data" ON customers
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Customers can update their own data" ON customers
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for hairstyles (public read, admin write)
CREATE POLICY "Hairstyles are viewable by everyone" ON hairstyles
  FOR SELECT USING (true);

-- Create policies for appointments
CREATE POLICY "Customers can view their own appointments" ON appointments
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create their own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = customer_id);

-- Create admin role for managing all data
CREATE ROLE admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;

-- Insert some initial data for hairstyles
INSERT INTO hairstyles (name, description, price, duration, category, image_url)
VALUES 
  ('Modern Fade', 'A contemporary take on the classic fade haircut, featuring a gradual blend from short to shorter with textured styling on top.', 35.00, 45, 'Short', '/images/modern-fade.jpg'),
  ('Classic Bob', 'A timeless bob cut that falls at chin length, with clean lines and a precise finish for a polished look.', 45.00, 60, 'Medium', '/images/classic-bob.jpg'),
  ('Textured Pixie', 'A short, layered cut with plenty of texture and movement, perfect for those wanting a low-maintenance yet stylish look.', 40.00, 45, 'Short', '/images/textured-pixie.jpg'),
  ('Long Layers', 'Beautiful, flowing layers that add movement and volume to longer hair, customized to suit your face shape.', 55.00, 75, 'Long', '/images/long-layers.jpg'),
  ('Blunt Cut', 'A sharp, precise cut with no layers, creating a bold statement look that works well with straight hair.', 40.00, 45, 'Medium', '/images/blunt-cut.jpg'),
  ('Curly Shag', 'A layered cut specifically designed to enhance natural curls, adding volume and shape while reducing bulk.', 50.00, 60, 'Medium', '/images/curly-shag.jpg');

-- Insert initial available slots (Monday-Friday, 9am-5pm)
INSERT INTO available_slots (day_of_week, start_time, end_time)
VALUES 
  (1, '09:00', '17:00'), -- Monday
  (2, '09:00', '17:00'), -- Tuesday
  (3, '09:00', '17:00'), -- Wednesday
  (4, '09:00', '17:00'), -- Thursday
  (5, '09:00', '17:00'); -- Friday

-- Insert initial settings
INSERT INTO settings (key, value)
VALUES 
  ('business_hours', '{"monday":{"open":"09:00","close":"17:00"},"tuesday":{"open":"09:00","close":"17:00"},"wednesday":{"open":"09:00","close":"17:00"},"thursday":{"open":"09:00","close":"17:00"},"friday":{"open":"09:00","close":"17:00"},"saturday":{"open":"","close":""},"sunday":{"open":"","close":""}}'),
  ('appointment_duration', '{"default": 60, "buffer": 15}'),
  ('business_info', '{"name":"StyleSync","address":"123 Hair Street, London, UK","phone":"+44 20 1234 5678","email":"info@stylesync.com"}');


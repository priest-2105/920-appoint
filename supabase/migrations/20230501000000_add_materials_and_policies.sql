-- Add materials column to hairstyles table
ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS materials TEXT;

-- Add is_guest_booking column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_guest_booking BOOLEAN DEFAULT FALSE;

-- Add is_admin column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add is_guest column to customers table to distinguish guest customers from account holders
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Create a function to check if current user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing policies on customers table
DROP POLICY IF EXISTS "Customers can view their own data" ON customers;
DROP POLICY IF EXISTS "Customers can update their own data" ON customers;
DROP POLICY IF EXISTS "Admins can view all customer data" ON customers;
DROP POLICY IF EXISTS "Allow admin users to read customer data" ON customers;
DROP POLICY IF EXISTS "Allow admin users to insert customer data" ON customers;
DROP POLICY IF EXISTS "Allow admin users to update customer data" ON customers;
DROP POLICY IF EXISTS "Allow admin users to delete customer data" ON customers;

-- Create simple, working policies for customers table
CREATE POLICY "Customers can view their own data or admin can view all" ON customers
  FOR SELECT USING (
    auth.uid() = id OR is_admin_user()
  );
  
CREATE POLICY "Customers can update their own data or admin can update all" ON customers
  FOR UPDATE USING (
    auth.uid() = id OR is_admin_user()
  );

CREATE POLICY "Customers can insert their own data or admin can insert any" ON customers
  FOR INSERT WITH CHECK (
    auth.uid() = id OR is_admin_user()
  );

CREATE POLICY "Admin can delete any customer" ON customers
  FOR DELETE USING (
    is_admin_user()
  );

-- Drop all existing policies on appointments table
DROP POLICY IF EXISTS "Customers can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Customers can create their own appointments" ON appointments;
DROP POLICY IF EXISTS "Customers can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update all appointments" ON appointments;

-- Create simple, working policies for appointments table
CREATE POLICY "Customers can view their own appointments or admin can view all" ON appointments
  FOR SELECT USING (
    auth.uid() = customer_id OR is_admin_user()
  );

CREATE POLICY "Customers can create their own appointments or admin can create any" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR is_admin_user()
  );

CREATE POLICY "Customers can update their own appointments or admin can update all" ON appointments
  FOR UPDATE USING (
    auth.uid() = customer_id OR is_admin_user()
  );

CREATE POLICY "Admin can delete any appointment" ON appointments
  FOR DELETE USING (
    is_admin_user()
  );

-- Create appointment policy in settings if it doesn't exist
INSERT INTO settings (key, value)
VALUES (
  'appointment_policy',
  '{
    "cancellationPolicy": "Customers must cancel at least 24 hours before their appointment to avoid a cancellation fee.",
    "cancellationTimeFrame": "24",
    "cancellationFee": "50",
    "noShowPolicy": "Clients who fail to show up for their appointment will be charged the full service price.",
    "noShowFee": "100",
    "lateArrivalPolicy": "If you arrive more than 15 minutes late, we may need to reschedule your appointment.",
    "depositRequired": false,
    "depositAmount": "20",
    "refundPolicy": "Deposits are non-refundable but may be applied to a rescheduled appointment.",
    "reschedulePolicy": "Appointments can be rescheduled up to 24 hours before the scheduled time.",
    "rescheduleTimeFrame": "24"
  }'
)
ON CONFLICT (key) DO NOTHING;

-- Add materials column to hairstyles table
ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS materials TEXT;

-- Add is_guest_booking column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_guest_booking BOOLEAN DEFAULT FALSE;

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

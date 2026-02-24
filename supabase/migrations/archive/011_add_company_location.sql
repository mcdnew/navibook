-- Add company location fields (GPS coordinates)
-- Allows each company to have their own weather location

ALTER TABLE companies
ADD COLUMN latitude DECIMAL(10,6),
ADD COLUMN longitude DECIMAL(10,6),
ADD COLUMN location_name TEXT;

-- Create indexes for faster queries
CREATE INDEX idx_companies_location ON companies(latitude, longitude);

-- Seed demo company with default Mediterranean location
UPDATE companies
SET
  latitude = 41.3851,
  longitude = 2.1734,
  location_name = 'Barcelona, Spain'
WHERE name = 'NaviBook Demo' AND latitude IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN companies.latitude IS 'Latitude coordinate in decimal degrees (-90 to 90). Positive = North, Negative = South';
COMMENT ON COLUMN companies.longitude IS 'Longitude coordinate in decimal degrees (-180 to 180). Positive = East, Negative = West';
COMMENT ON COLUMN companies.location_name IS 'Human-readable location name (e.g., "Barcelona, Spain")';

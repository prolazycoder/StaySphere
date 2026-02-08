-- 1. Insert User (Role = DRIVER)
INSERT INTO app_user (
    id, 
    full_name, 
    email, 
    phone_number, 
    role, 
    is_active, 
    country, 
    city, 
    gender, 
    auth_provider, 
    flag,
    profile_image
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- User UUID
    'Dummy Driver', 
    'driver@test.com', 
    '9876543210', 
    'DRIVER', 
    true, 
    'India', 
    'PUNE', 
    'MALE', 
    'EMAIL', 
    false,
    '\x' -- Empty byte array for image
);

-- 2. Insert Driver (Linked to User)
INSERT INTO cab_owners (
    driver_id, 
    user_id, 
    pan_verified, 
    aadhar_verified, 
    license_verified, 
    blocked, 
    status,
    current_latitude,
    current_longitude
) VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', -- Driver UUID
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- FK to User
    true, 
    true, 
    true, 
    false, 
    'OFFLINE',
    18.604286, -- Default Lat (Bangalore)
    73.734287  -- Default Lng (Bangalore)
);

-- 3. Insert Vehicle (Linked to Driver)
INSERT INTO vehicles (
    vehicle_id, 
    cab_owner_id, 
    vehicle_model, 
    vehicle_number, 
    vehicle_type, 
    seating_capacity
) VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', -- Vehicle UUID
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', -- FK to Driver
    'Swift Dzire', 
    'KA-01-AB-1234', 
    'SEDAN', 
    4
);

-- 4. Insert Driver Dues (Linked to Driver)
-- Prevents NullPointerException when checking dues
INSERT INTO driver_dues (
    due_id, 
    driver_id, 
    amount_due_to_company, 
    total_gross_earnings, 
    week_start, 
    week_end, 
    blocked
) VALUES (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', -- Due UUID
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', -- FK to Driver
    0.00, 
    0.00, 
    CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int + 1, -- Monday of this week
    CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int + 7, -- Sunday of this week
    false
);

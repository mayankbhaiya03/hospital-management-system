-- Database seeding for hms_db
-- Create database if not exists (handled by JPA connection URL, but good for manual setup)
CREATE DATABASE IF NOT EXISTS hms_db;
USE hms_db;

-- 1. Insert Users (roles: ADMIN, DOCTOR, RECEPTIONIST, PATIENT)
-- Note: passwords are stored in plain text for demonstration/ease of local development
INSERT INTO users (id, username, password, role, full_name, email, phone) VALUES
(1, 'admin', 'admin123', 'ADMIN', 'System Administrator', 'admin@hms.com', '9876543210'),
(2, 'doctor1', 'doc123', 'DOCTOR', 'Sarah Connor', 'sarah.c@hms.com', '9876543211'),
(3, 'doctor2', 'doc123', 'DOCTOR', 'John Doe', 'john.doe@hms.com', '9876543212'),
(4, 'receptionist1', 'rec123', 'RECEPTIONIST', 'Alice Smith', 'alice.s@hms.com', '9876543213'),
(5, 'patient1', 'pat123', 'PATIENT', 'Bruce Wayne', 'bruce@gotham.com', '9876543214'),
(6, 'patient2', 'pat123', 'PATIENT', 'Clark Kent', 'clark@metropolis.com', '9876543215')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Insert Doctors
INSERT INTO doctors (id, user_id, specialization, department, experience, consultation_fee, availability_status) VALUES
(1, 2, 'Cardiology', 'Cardiology', 12, 800.00, 'AVAILABLE'),
(2, 3, 'Pediatrics', 'Pediatrics', 8, 600.00, 'AVAILABLE')
ON DUPLICATE KEY UPDATE id=id;

-- 3. Insert Patients
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, medical_history) VALUES
(1, 5, '1985-02-19', 'Male', 'O+', 'Gotham City Wayne Manor', 'Chronic insomnia, muscle soreness, high stress.'),
(2, 6, '1988-06-18', 'Male', 'AB+', 'Smallville Farmhouse', 'No common illnesses. Unusual fatigue around green mineral stones.')
ON DUPLICATE KEY UPDATE id=id;

-- 4. Insert Appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, reason, status, prescription) VALUES
(1, 1, 1, '2026-05-20 10:00:00', 'Routine heart check and ECG evaluation.', 'COMPLETED', 'Aspirin 81mg once daily. Reduce high-stress operations and get 7-8 hours of sleep.'),
(2, 2, 2, '2026-05-23 14:30:00', 'General physical checkup and blood tests.', 'CONFIRMED', NULL)
ON DUPLICATE KEY UPDATE id=id;

-- 5. Insert Payments
INSERT INTO payments (id, appointment_id, amount, payment_date, payment_method, status, razorpay_order_id, razorpay_payment_id) VALUES
(1, 1, 800.00, '2026-05-20 10:45:00', 'CARD', 'PAID', 'order_GthM10293', 'pay_GthMPay0291'),
(2, 2, 600.00, NULL, NULL, 'PENDING', NULL, NULL)
ON DUPLICATE KEY UPDATE id=id;

-- 6. Insert Beds
INSERT INTO beds (id, bed_number, type, status, daily_charges) VALUES
(1, 'ICU-101', 'ICU', 'AVAILABLE', 2500.00),
(2, 'ICU-102', 'ICU', 'AVAILABLE', 2500.00),
(3, 'ICU-103', 'ICU', 'AVAILABLE', 2500.00),
(4, 'GEN-201', 'GENERAL_WARD', 'AVAILABLE', 500.00),
(5, 'GEN-202', 'GENERAL_WARD', 'AVAILABLE', 500.00),
(6, 'GEN-203', 'GENERAL_WARD', 'AVAILABLE', 500.00),
(7, 'PVT-301', 'PRIVATE', 'AVAILABLE', 1200.00),
(8, 'PVT-302', 'PRIVATE', 'AVAILABLE', 1200.00)
ON DUPLICATE KEY UPDATE id=id;

-- 7. Insert Operation Theaters
INSERT INTO operation_theaters (id, name, status, base_charges) VALUES
(1, 'OT-1', 'AVAILABLE', 1500.00),
(2, 'OT-2', 'AVAILABLE', 1500.00)
ON DUPLICATE KEY UPDATE id=id;


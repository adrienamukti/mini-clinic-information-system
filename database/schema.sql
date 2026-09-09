CREATE DATABASE IF NOT EXISTS mini_clinic_information_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE mini_clinic_information_system;

-- =====================================================
-- ROLES
-- =====================================================
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =====================================================
-- POLYCLINICS
-- =====================================================
CREATE TABLE polyclinics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- DOCTORS
-- =====================================================
CREATE TABLE doctors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    polyclinic_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_doctors_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_doctors_polyclinic
        FOREIGN KEY (polyclinic_id)
        REFERENCES polyclinics(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =====================================================
-- PATIENTS
-- =====================================================
CREATE TABLE patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medical_record_number VARCHAR(20) NOT NULL UNIQUE,
    nik VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Laki-laki', 'Perempuan') NOT NULL,
    date_of_birth DATE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- REGISTRATIONS
-- =====================================================
CREATE TABLE registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    polyclinic_id BIGINT UNSIGNED NOT NULL,
    visit_date DATE NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    initial_complaint TEXT NOT NULL,
    status ENUM(
        'Menunggu',
        'Check In',
        'Pemeriksaan',
        'Selesai'
    ) NOT NULL DEFAULT 'Menunggu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_registrations_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_registrations_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_registrations_polyclinic
        FOREIGN KEY (polyclinic_id)
        REFERENCES polyclinics(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =====================================================
-- QUEUES
-- =====================================================
CREATE TABLE queues (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT UNSIGNED NOT NULL UNIQUE,
    queue_date DATE NOT NULL,
    queue_number VARCHAR(10) NOT NULL,
    status ENUM(
        'Menunggu',
        'Dipanggil',
        'Selesai'
    ) NOT NULL DEFAULT 'Menunggu',
    called_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uk_queues_date_number
        UNIQUE (queue_date, queue_number),

    CONSTRAINT fk_queues_registration
        FOREIGN KEY (registration_id)
        REFERENCES registrations(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =====================================================
-- MEDICAL RECORDS
-- =====================================================
CREATE TABLE medical_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT UNSIGNED NOT NULL UNIQUE,
    subjective_complaint TEXT NOT NULL,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,1),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    diagnosis TEXT NOT NULL,
    therapy_plan TEXT,
    examined_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_medical_records_registration
        FOREIGN KEY (registration_id)
        REFERENCES registrations(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =====================================================
-- MEDICAL ACTIONS
-- =====================================================
CREATE TABLE medical_actions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medical_record_id BIGINT UNSIGNED NOT NULL,
    action_name VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_medical_actions_record
        FOREIGN KEY (medical_record_id)
        REFERENCES medical_records(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =====================================================
-- PRESCRIPTIONS
-- =====================================================
CREATE TABLE prescriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medical_record_id BIGINT UNSIGNED NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_prescriptions_record
        FOREIGN KEY (medical_record_id)
        REFERENCES medical_records(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =====================================================
-- PRESCRIPTION ITEMS
-- =====================================================
CREATE TABLE prescription_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    prescription_id BIGINT UNSIGNED NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    quantity INT UNSIGNED NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_prescription_items_prescription
        FOREIGN KEY (prescription_id)
        REFERENCES prescriptions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
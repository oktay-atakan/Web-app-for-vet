-- VetApp database schema
-- Apply with a privileged MySQL account (root or equivalent).

CREATE DATABASE IF NOT EXISTS vetapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vetapp;

CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(150) NOT NULL,
  role            ENUM('admin','vet','staff') NOT NULL DEFAULT 'staff',
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(150) NOT NULL,
  phone        VARCHAR(30),
  email        VARCHAR(255),
  address      TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_full_name (full_name),
  INDEX idx_customers_phone (phone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pets (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT NOT NULL,
  name         VARCHAR(100) NOT NULL,
  species      VARCHAR(50) NOT NULL,
  breed        VARCHAR(100),
  birth_date   DATE,
  weight_kg    DECIMAL(6,2),
  notes        TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_pets_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS procedures (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  pet_id              INT NOT NULL,
  type                ENUM('vaccination','checkup','treatment','surgery','other') NOT NULL,
  name                VARCHAR(150) NOT NULL,
  date_administered   DATE NOT NULL,
  next_due_date       DATE,
  performed_by        INT,
  notes               TEXT,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_procedures_pet FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_procedures_performed_by FOREIGN KEY (performed_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_procedures_next_due_date (next_due_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_id   INT NOT NULL,
  pet_id        INT,
  scheduled_at  DATETIME NOT NULL,
  status        ENUM('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
  reason        VARCHAR(255),
  assigned_to   INT,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_appointments_scheduled_at (scheduled_at),
  INDEX idx_appointments_status (status)
) ENGINE=InnoDB;
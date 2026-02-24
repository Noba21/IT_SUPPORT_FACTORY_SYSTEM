-- =============================================
-- Factory IT Support Management System
-- MySQL Schema (WAMP)
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------
-- Database
-- ---------------------------------------------
CREATE DATABASE IF NOT EXISTS it_support_factory
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE it_support_factory;

-- ---------------------------------------------
-- Table: departments
-- ---------------------------------------------
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------
-- Table: users
-- ---------------------------------------------
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  department_id INT UNSIGNED DEFAULT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  location_type ENUM('hq', 'factory') DEFAULT NULL,
  photo VARCHAR(255) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'technician', 'department') NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_department (department_id),
  KEY idx_users_role (role),
  KEY idx_users_status (status),
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------
-- Table: issues
-- ---------------------------------------------
CREATE TABLE issues (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  technician_id INT UNSIGNED DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  screenshot VARCHAR(255) DEFAULT NULL,
  material_requirements TEXT DEFAULT NULL,
  needs_outsourcing TINYINT(1) NOT NULL DEFAULT 0,
  outsourcing_note TEXT DEFAULT NULL,
  outsourcing_screenshot VARCHAR(255) DEFAULT NULL,
  problem_type ENUM('hardware', 'software') DEFAULT NULL,
  priority ENUM('urgent', 'not_urgent') NOT NULL DEFAULT 'not_urgent',
  status ENUM('pending', 'in_progress', 'resolved') NOT NULL DEFAULT 'pending',
  resolution_note TEXT DEFAULT NULL,
  user_feedback ENUM('fixed', 'not_fixed') DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_issues_user (user_id),
  KEY idx_issues_technician (technician_id),
  KEY idx_issues_status (status),
  KEY idx_issues_priority (priority),
  KEY idx_issues_created (created_at),
  CONSTRAINT fk_issues_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_issues_technician FOREIGN KEY (technician_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------
-- Table: chats (one per issue)
-- ---------------------------------------------
CREATE TABLE chats (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  issue_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_chats_issue (issue_id),
  CONSTRAINT fk_chats_issue FOREIGN KEY (issue_id) REFERENCES issues (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------
-- Table: messages
-- ---------------------------------------------
CREATE TABLE messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  chat_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_chat (chat_id),
  KEY idx_messages_created (created_at),
  CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


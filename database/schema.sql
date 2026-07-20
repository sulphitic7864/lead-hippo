SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_salt CHAR(32) NOT NULL,
  password_hash CHAR(128) NOT NULL,
  display_name VARCHAR(120) NOT NULL DEFAULT 'Administrator',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id CHAR(36) PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  expires_at DATETIME NOT NULL,
  last_seen_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_sessions_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_admin_sessions_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trade_types (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(110) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_number_sequences (
  sequence_year SMALLINT UNSIGNED PRIMARY KEY,
  next_number INT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  lead_code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  trade_type_id BIGINT UNSIGNED NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL DEFAULT 'ON',
  budget_min_cents INT UNSIGNED NOT NULL,
  budget_max_cents INT UNSIGNED NOT NULL,
  timeline VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  hippo_score TINYINT UNSIGNED NOT NULL,
  price_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'CAD',
  spots_total TINYINT UNSIGNED NOT NULL DEFAULT 3,
  spots_remaining TINYINT UNSIGNED NOT NULL DEFAULT 3,
  status ENUM('DRAFT','ACTIVE','SOLD_OUT','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  homeowner_name VARCHAR(160) NOT NULL,
  homeowner_phone VARCHAR(40) NOT NULL,
  homeowner_email VARCHAR(190) NULL,
  preferred_contact ENUM('PHONE','TEXT','EMAIL') NOT NULL DEFAULT 'PHONE',
  homeowner_contacted_at DATETIME NOT NULL,
  consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  consent_confirmed_at DATETIME NULL,
  published_at DATETIME NULL,
  expires_at DATETIME NULL,
  sold_out_at DATETIME NULL,
  archived_at DATETIME NULL,
  view_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_leads_trade FOREIGN KEY (trade_type_id) REFERENCES trade_types(id),
  CONSTRAINT chk_lead_budget CHECK (budget_min_cents <= budget_max_cents),
  CONSTRAINT chk_lead_score CHECK (hippo_score BETWEEN 0 AND 100),
  CONSTRAINT chk_lead_spots CHECK (spots_remaining <= spots_total AND spots_total BETWEEN 1 AND 3),
  INDEX idx_leads_public (status, published_at),
  INDEX idx_leads_featured (is_featured, status),
  INDEX idx_leads_expiry (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_photos (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  public_url VARCHAR(500) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lead_photos_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_lead_photos_order (lead_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_score_reasons (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(180) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_score_reasons_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  UNIQUE KEY uq_lead_reason (lead_id, reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS consent_records (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  lead_id BIGINT UNSIGNED NOT NULL,
  consent_method ENUM('PHONE_VERBAL','SMS_REPLY','EMAIL','WRITTEN') NOT NULL,
  consent_text TEXT NULL,
  evidence_path VARCHAR(500) NULL,
  consent_received_at DATETIME NOT NULL,
  admin_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consent_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_consent_lead (lead_id, consent_received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id CHAR(36) PRIMARY KEY,
  stripe_checkout_session_id VARCHAR(255) NULL UNIQUE,
  buyer_company VARCHAR(190) NOT NULL,
  buyer_email VARCHAR(190) NOT NULL,
  buyer_email_normalized VARCHAR(190) NOT NULL,
  buyer_phone VARCHAR(40) NOT NULL,
  buyer_phone_normalized VARCHAR(40) NOT NULL,
  subtotal_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'CAD',
  status ENUM('CREATING','PENDING','PAID','EXPIRED','CANCELLED','FAILED','REFUNDED') NOT NULL DEFAULT 'CREATING',
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at DATETIME NOT NULL,
  paid_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_checkout_expiry (status, expires_at),
  INDEX idx_checkout_buyer (buyer_email_normalized, buyer_phone_normalized)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checkout_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  checkout_session_id CHAR(36) NOT NULL,
  lead_id BIGINT UNSIGNED NOT NULL,
  unit_price_cents INT UNSIGNED NOT NULL,
  reservation_released BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_checkout_items_session FOREIGN KEY (checkout_session_id) REFERENCES checkout_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_checkout_items_lead FOREIGN KEY (lead_id) REFERENCES leads(id),
  UNIQUE KEY uq_checkout_lead (checkout_session_id, lead_id),
  INDEX idx_checkout_items_lead (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchases (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  checkout_session_id CHAR(36) NOT NULL,
  checkout_item_id BIGINT UNSIGNED NOT NULL,
  lead_id BIGINT UNSIGNED NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,
  buyer_company VARCHAR(190) NOT NULL,
  buyer_email VARCHAR(190) NOT NULL,
  buyer_phone VARCHAR(40) NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'CAD',
  payment_status ENUM('PAID','REFUNDED','PARTIALLY_REFUNDED','DISPUTED') NOT NULL DEFAULT 'PAID',
  report_status ENUM('PENDING','GENERATED','FAILED') NOT NULL DEFAULT 'PENDING',
  report_path VARCHAR(500) NULL,
  email_status ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  terms_version VARCHAR(50) NOT NULL DEFAULT 'v1',
  privacy_version VARCHAR(50) NOT NULL DEFAULT 'v1',
  refund_policy_version VARCHAR(50) NOT NULL DEFAULT 'v1',
  purchased_at DATETIME NOT NULL,
  refunded_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchases_checkout FOREIGN KEY (checkout_session_id) REFERENCES checkout_sessions(id),
  CONSTRAINT fk_purchases_item FOREIGN KEY (checkout_item_id) REFERENCES checkout_items(id),
  CONSTRAINT fk_purchases_lead FOREIGN KEY (lead_id) REFERENCES leads(id),
  UNIQUE KEY uq_purchase_item (checkout_item_id),
  INDEX idx_purchases_date (purchased_at),
  INDEX idx_purchases_lead (lead_id),
  INDEX idx_purchases_buyer (buyer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stripe_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(120) NOT NULL,
  payload_hash CHAR(64) NOT NULL,
  status ENUM('PROCESSING','PROCESSED','FAILED') NOT NULL DEFAULT 'PROCESSING',
  processed_at DATETIME NULL,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  company VARCHAR(190) NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('NEW','READ','REPLIED','ARCHIVED') NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refund_claims (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  purchase_id BIGINT UNSIGNED NOT NULL,
  reason ENUM('UNREACHABLE','INVALID_CONTACT','PROJECT_CANCELLED_BEFORE_CONTACT','DUPLICATE_CHARGE','OTHER') NOT NULL,
  contractor_message TEXT NOT NULL,
  contact_attempt_log TEXT NULL,
  status ENUM('SUBMITTED','UNDER_REVIEW','APPROVED_REPLACEMENT','APPROVED_REFUND','REJECTED','COMPLETED') NOT NULL DEFAULT 'SUBMITTED',
  admin_notes TEXT NULL,
  resolution TEXT NULL,
  stripe_refund_id VARCHAR(255) NULL,
  submitted_at DATETIME NOT NULL,
  resolved_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_refund_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  INDEX idx_refund_status (status, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marketing_consents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  email_normalized VARCHAR(190) NOT NULL,
  consented BOOLEAN NOT NULL,
  source VARCHAR(100) NOT NULL,
  consented_at DATETIME NULL,
  withdrawn_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_marketing_email (email_normalized)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS policy_versions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  policy_type ENUM('TERMS','PRIVACY','REFUNDS','DISCLAIMERS') NOT NULL,
  version VARCHAR(50) NOT NULL,
  effective_at DATETIME NOT NULL,
  content_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_policy_version (policy_type, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  job_type ENUM('FULFILL_PURCHASE','CONTACT_NOTIFICATION','RESEND_REPORT') NOT NULL,
  payload JSON NOT NULL,
  status ENUM('PENDING','PROCESSING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 5,
  available_at DATETIME NOT NULL,
  locked_at DATETIME NULL,
  locked_by VARCHAR(100) NULL,
  completed_at DATETIME NULL,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jobs_queue (status, available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NULL,
  entity_id VARCHAR(80) NULL,
  metadata JSON NULL,
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

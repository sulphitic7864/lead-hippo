INSERT IGNORE INTO trade_types (name, slug, sort_order) VALUES
('Kitchen', 'kitchen', 1),
('Bathroom', 'bathroom', 2),
('Roofing', 'roofing', 3),
('Basement', 'basement', 4),
('Flooring', 'flooring', 5),
('Other', 'other', 99);

INSERT INTO settings (setting_key, setting_value, is_public) VALUES
('lead_expiry_days', '7', FALSE),
('max_featured_leads', '3', FALSE),
('max_spots_per_lead', '3', TRUE),
('support_email', 'leads@leadhippo.ca', TRUE),
('refund_window_days', '7', TRUE),
('unreachable_business_days', '5', TRUE)
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), is_public = VALUES(is_public);

-- Development admin login: admin@leadhippo.ca / ChangeMe123!
-- Change this immediately after first login or run: npm run create-admin -w @leadhippo/api
INSERT IGNORE INTO admin_users (email, password_salt, password_hash, display_name)
VALUES (
  'admin@leadhippo.ca',
  '768dd7f0e1a18e36523b7014760712a2',
  '0eec3f434eb45ce84cd202bdd2874f4059f4db72e5ef07da9f63677d4ad2c53b72f09aaa29ffc8c20bbc5ee1037c48efec75d7e4b632ffe8e5abb69ea8760569',
  'Lead Hippo Admin'
);

INSERT IGNORE INTO policy_versions (policy_type, version, effective_at, content_hash) VALUES
('TERMS', 'v1', UTC_TIMESTAMP(), SHA2('Lead Hippo Terms v1', 256)),
('PRIVACY', 'v1', UTC_TIMESTAMP(), SHA2('Lead Hippo Privacy v1', 256)),
('REFUNDS', 'v1', UTC_TIMESTAMP(), SHA2('Lead Hippo Refunds v1', 256)),
('DISCLAIMERS', 'v1', UTC_TIMESTAMP(), SHA2('Lead Hippo Disclaimers v1', 256));

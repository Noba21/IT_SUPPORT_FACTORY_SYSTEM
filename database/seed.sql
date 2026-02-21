-- Seed departments and default admin (run after schema.sql)
USE it_support_factory;

INSERT INTO departments (name, description) VALUES
('Production', 'Manufacturing and production operations'),
('HR', 'Human resources and personnel'),
('Finance', 'Finance and accounting'),
('IT', 'Information technology'),
('Maintenance', 'Equipment and facility maintenance'),
('Quality', 'Quality assurance and control'),
('Logistics', 'Supply chain and logistics');

-- Default admin: admin@factory.com / password (change after first login)
INSERT INTO users (full_name, email, password, role, status) VALUES
('System Admin', 'admin@factory.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');

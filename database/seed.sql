USE medease;

-- Insert sample admin (password: admin123)
INSERT INTO admins (username, password, email, full_name) VALUES
('admin', '$2a$10$xLRxPzQ5Ot1Kz1jVjxbQO.sCg.Qw3X4YBtKZ9QUO.1z9wqQMEq2Wy', 'admin@medease.com', 'System Administrator');

-- Insert sample doctors (password: doctor123)
INSERT INTO doctors (username, password, email, full_name, specialization, phone) VALUES
('dr.smith', '$2a$10$xLRxPzQ5Ot1Kz1jVjxbQO.sCg.Qw3X4YBtKZ9QUO.1z9wqQMEq2Wy', 'smith@medease.com', 'Dr. John Smith', 'Cardiologist', '+1234567890'),
('dr.jones', '$2a$10$xLRxPzQ5Ot1Kz1jVjxbQO.sCg.Qw3X4YBtKZ9QUO.1z9wqQMEq2Wy', 'jones@medease.com', 'Dr. Sarah Jones', 'Pediatrician', '+1234567891');

-- Insert sample patients (password: patient123)
INSERT INTO patients (username, password, email, full_name, phone, date_of_birth) VALUES
('john.doe', '$2a$10$xLRxPzQ5Ot1Kz1jVjxbQO.sCg.Qw3X4YBtKZ9QUO.1z9wqQMEq2Wy', 'john@example.com', 'John Doe', '+1234567892', '1990-01-15'),
('jane.smith', '$2a$10$xLRxPzQ5Ot1Kz1jVjxbQO.sCg.Qw3X4YBtKZ9QUO.1z9wqQMEq2Wy', 'jane@example.com', 'Jane Smith', '+1234567893', '1985-06-22');

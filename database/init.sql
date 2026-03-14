-- Tablas base
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'Cuenta Corriente', 'Cuenta Vista'
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    type VARCHAR(20) NOT NULL, -- 'DEPÓSITO', 'RETIRO', 'TRANSFERENCIA'
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_number VARCHAR(20) UNIQUE NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    credit_limit DECIMAL(15, 2) NOT NULL,
    used_amount DECIMAL(15, 2) DEFAULT 0.00,
    billed_amount DECIMAL(15, 2) DEFAULT 0.00,
    unbilled_amount DECIMAL(15, 2) DEFAULT 0.00,
    expiry_date VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS external_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    bank VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    rut VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDIENTE'
);

-- Datos iniciales
INSERT INTO users (username, password, full_name) 
VALUES ('admin', 'admin123', 'Alex Thompson')
ON CONFLICT (username) DO NOTHING;

INSERT INTO accounts (user_id, account_number, account_type, balance)
VALUES 
(1, '9827-1123-45', 'Cuenta Corriente', 2450000.00),
(1, '4521-8890-12', 'Cuenta Vista', 125000.00)
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO credit_cards (user_id, card_number, card_type, credit_limit, used_amount, billed_amount, unbilled_amount, expiry_date)
VALUES (1, '**** **** **** 8829', 'VISA INFINITE PLATINUM', 1500000.00, 320500.00, 150000.00, 170500.00, '12/28')
ON CONFLICT (card_number) DO NOTHING;

INSERT INTO external_contacts (user_id, name, bank, account_number, rut)
VALUES 
(1, 'Juan Pérez', 'Banco Estado', '12345678', '12.345.678-9'),
(1, 'María García', 'Santander', '87654321', '8.765.432-1'),
(1, 'Soporte TI', 'Banco de Chile', '55556666', '15.555.666-k')
ON CONFLICT DO NOTHING;

INSERT INTO payments (user_id, service_name, amount, due_date)
VALUES 
(1, 'Electricidad (Enel)', 45000.00, '2026-03-24'),
(1, 'Internet (VTR)', 28990.00, '2026-03-31')
ON CONFLICT DO NOTHING;

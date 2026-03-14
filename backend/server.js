const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'bankuser',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'bankdb',
  password: process.env.DB_PASSWORD || 'bankpassword',
  port: 5432,
});

// Auth
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password_hash = $2', [username, password]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ success: true, user: { id: user.id, username: user.username, fullName: user.full_name, plan: user.plan } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accounts
app.get('/api/accounts', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query('SELECT * FROM accounts WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions
app.get('/api/transactions', async (req, res) => {
  const { accountId } = req.query;
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE account_id = $1 ORDER BY date DESC', [accountId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments
app.get('/api/payments', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query('SELECT * FROM payments WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Credit Cards
app.get('/api/cards', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query('SELECT * FROM credit_cards WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TRANSFERENCIA REAL (ATÓMICA)
app.post('/api/transfer', async (req, res) => {
  const { fromAccountId, amount, description, toAccountInfo } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Obtener saldo actual y verificar fondos
    const fromAccRes = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromAccountId]);
    if (fromAccRes.rows.length === 0) throw new Error('Cuenta de origen no existe');
    
    const currentBalance = parseFloat(fromAccRes.rows[0].balance);
    if (currentBalance < amount) throw new Error('Fondos insuficientes');
    
    // 2. Descontar saldo
    const newFromBalance = currentBalance - amount;
    await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newFromBalance, fromAccountId]);
    
    // 3. Registrar transacción de débito
    await client.query(
      'INSERT INTO transactions (account_id, description, amount, type, balance_after) VALUES ($1, $2, $3, $4, $5)',
      [fromAccountId, description || 'Transferencia enviada', amount, 'debit', newFromBalance]
    );

    // 4. (Opcional) Si es entre cuentas propias o a otro conocido en la DB
    // Por simplicidad para este demo, si toAccountInfo es un ID de cuenta existente, abonamos
    if (toAccountInfo && !isNaN(toAccountInfo)) {
        const toAccRes = await client.query('SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [toAccountInfo]);
        if (toAccRes.rows.length > 0) {
            const currentToBalance = parseFloat(toAccRes.rows[0].balance);
            const newToBalance = currentToBalance + amount;
            await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newToBalance, toAccountInfo]);
            await client.query(
               'INSERT INTO transactions (account_id, description, amount, type, balance_after) VALUES ($1, $2, $3, $4, $5)',
               [toAccountInfo, `Recibido de Alex: ${description}`, amount, 'credit', newToBalance]
            );
        }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Transferencia realizada con éxito' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});

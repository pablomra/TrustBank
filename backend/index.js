import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://bankuser:bankpassword@db:5432/bankdb'
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM accounts ORDER BY account_type DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Credit Cards with detailed amounts
app.get('/api/cards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM credit_cards');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get External Contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM external_contacts');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Transfer Funds
app.post('/api/transfer', async (req, res) => {
    const { sourceAccountId, targetAccountId, amount, description, isExternal } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Check source balance
        const sourceRes = await client.query('SELECT balance FROM accounts WHERE id = $1', [sourceAccountId]);
        if (sourceRes.rows.length === 0) throw new Error('Cuenta de origen no encontrada');
        
        const sourceBalance = parseFloat(sourceRes.rows[0].balance);
        if (sourceBalance < amount) throw new Error('Saldo insuficiente');

        // Discount from source
        await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, sourceAccountId]);

        // If internal, add to target
        if (!isExternal && targetAccountId) {
            await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, targetAccountId]);
        }

        // Record transaction
        await client.query(
            'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
            [sourceAccountId, 'TRANSFERENCIA', -amount, description || 'Transferencia enviada']
        );

        await client.query('COMMIT');
        res.json({ success: true, message: 'Transferencia realizada con éxito' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
});

// Get Payments
app.get('/api/payments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payments WHERE status = \'PENDIENTE\'');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});

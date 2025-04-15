const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Conexão com PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Testar conexão
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar no banco:', err.stack);
    }
    console.log('Conectado ao PostgreSQL');
    release();
});

// Rota para salvar dados
app.post('/salvar', async (req, res) => {
    console.log('Recebido:', req.body);
    const { email, senha } = req.body;

    try {
        await pool.query(
            'INSERT INTO usuarios (email, senha) VALUES ($1, $2)',
            [email, senha]
        );
        res.send('Dados salvos com sucesso!');
    } catch (err) {
        console.error('Erro ao inserir:', err);
        res.status(500).send('Erro ao salvar no banco');
    }
});

// Listar usuários
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        res.status(500).send('Erro ao buscar no banco');
    }
});

// Excluir usuário
app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            res.status(404).send('Usuário não encontrado');
        } else {
            res.send('Usuário excluído com sucesso!');
        }
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        res.status(500).send('Erro ao excluir do banco');
    }
});



// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});

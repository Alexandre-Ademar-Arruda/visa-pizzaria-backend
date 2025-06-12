// 1. Importa as bibliotecas necessárias
require('dotenv').config();
const express = require('express'); // Framework web
const mongoose = require('mongoose'); // ODM para MongoDB
const multer = require('multer'); // Upload de arquivos
const cors = require('cors'); // Permite acesso de outros domínios (frontend)
const path = require('path'); // Manipula caminhos de arquivos
const fs = require('fs'); // Adicionado para manipular arquivos e pastas

const app = express(); // Cria o servidor Express

// 2. Conecta ao MongoDB
mongoose.connect(process.env.MONGODB_URI);

// 2.1. Garante que a pasta uploads exista na raiz do projeto
const uploadDir = path.join(__dirname, 'uploads'); // Caminho correto para uploads
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 3. Define o modelo da pizza
const pizzaSchema = new mongoose.Schema({
    nome: String,
    ingredientes: String,
    preco: {
        pequeno: String,
        medio: String,
        grande: String
    },
    imagem: String // Caminho do arquivo da imagem
});
const Pizza = mongoose.model('Pizza', pizzaSchema);

// 4. Middlewares globais
app.use(cors()); // Permite requisições de outros domínios
app.use(express.json()); // Permite receber JSON
app.use(express.urlencoded({ extended: true })); // Permite receber dados de formulários

// 5. Configura o multer para salvar arquivos em 'uploads/' na raiz do projeto
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Usa a pasta garantida acima
    },
    filename: function (req, file, cb) {
        // Salva o arquivo com um nome único (timestamp + extensão)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 6. Rota para servir imagens estáticas (acesso público)
app.use('/uploads', express.static(uploadDir));

// 7. Rota para cadastrar uma nova pizza (recebe imagem e dados)
app.post('/api/pizzas', upload.single('imagem'), async (req, res) => {
    try {
        const { nome, ingredientes, preco_pequeno, preco_medio, preco_grande } = req.body;
        const pizza = new Pizza({
            nome,
            ingredientes,
            preco: {
                pequeno: preco_pequeno || '',
                medio: preco_medio || '',
                grande: preco_grande || ''
            },
            imagem: req.file ? `/uploads/${req.file.filename}` : ''
        });
        await pizza.save();
        res.status(201).json({ message: 'Pizza salva com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Rota para listar todas as pizzas cadastradas
app.get('/api/pizzas', async (req, res) => {
    const pizzas = await Pizza.find();
    res.json(pizzas);
});

// 9. Inicia o servidor na porta 3001
app.listen(3001, () => {
    console.log('Servidor rodando em http://localhost:3001');
});
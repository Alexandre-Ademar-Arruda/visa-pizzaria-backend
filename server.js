// 1. Importa as bibliotecas necessárias
require('./KeepAlive.js'); // Modulo para manter o backend ativo
require('dotenv').config();
const express  = require('express');  // Framework web
const mongoose = require('mongoose'); // ODM para MongoDB
const multer   = require('multer');   // Upload de arquivos
const cors     = require('cors');     // Permite acesso de outros domínios (frontend)
const path     = require('path');     // Manipula caminhos de arquivos
const fs       = require('fs');       // Manipula arquivos e pastas

const app = express();                // Cria o servidor Express

// 2. Conecta ao MongoDB
mongoose.connect(process.env.MONGODB_URI);

// 2.1. Garante que a pasta uploads exista na raiz do projeto
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// === 3. SCHEMAS ============================================================
// 3A. Pizza (já existia)
const pizzaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,
  preco: { pequeno: String, medio: String, grande: String },
  imagem: String
});
const Pizza = mongoose.model('Pizza', pizzaSchema);

// 3B. Bebida (NOVO)
const bebidaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,   // descrição opcional
  preco: String,          // ex.: '8.00'  (use objeto se quiser tamanhos)
  imagem: String
});
const Bebida = mongoose.model('Bebida', bebidaSchema);

// 4. Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Configura o multer para salvar arquivos em /uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 6. Rota estática para imagens
app.use('/uploads', express.static(uploadDir));

// ====================== ROTAS PIZZA ========================================
// POST /api/pizzas
app.post('/api/pizzas', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, ingredientes, preco_pequeno, preco_medio, preco_grande } = req.body;
    const pizza = new Pizza({
      nome,
      ingredientes,
      preco: {
        pequeno: preco_pequeno || '',
        medio:   preco_medio   || '',
        grande:  preco_grande  || ''
      },
      imagem: req.file ? `/uploads/${req.file.filename}` : ''
    });
    await pizza.save();
    res.status(201).json({ message: 'Pizza salva com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pizzas
app.get('/api/pizzas', async (_, res) => {
  const pizzas = await Pizza.find();
  res.json(pizzas);
});

// ====================== ROTAS BEBIDA (NOVAS) ===============================
// POST /api/bebidas
app.post('/api/bebidas', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, ingredientes, preco } = req.body;
    const bebida = new Bebida({
      nome,
      ingredientes,
      preco,
      imagem: req.file ? `/uploads/${req.file.filename}` : ''
    });
    await bebida.save();
    res.status(201).json({ message: 'Bebida salva com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bebidas
app.get('/api/bebidas', async (_, res) => {
  const bebidas = await Bebida.find();
  res.json(bebidas);
});


// ✅Rota de teste para verificar se o servidor esta rodando
app.get('/', (req, res) => {
  res.send('API ViSa Pizzaria online!');
  console.log(`Ping recebido - servidor está ativo!`);
});


// 9. Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

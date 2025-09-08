// 1. Importa as bibliotecas necessárias
require('./KeepAlive.js'); // Módulo para manter o backend ativo
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

// 2. Conecta ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// === 3. SCHEMAS ============================================================
// Pizza
const pizzaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,
  preco: { pequeno: String, medio: String, grande: String },
  imagem: String // aqui vai a base64
});
const Pizza = mongoose.model('Pizza', pizzaSchema);

// Bebida
const bebidaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,
  preco: String,
  imagem: String
});
const Bebida = mongoose.model('Bebida', bebidaSchema);

// Sobremesa
const sobremesaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,
  preco: String,
  imagem: String
});
const Sobremesa = mongoose.model('Sobremesa', sobremesaSchema);

// Salada
const saladaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,
  preco: String,
  imagem: String
});
const Salada = mongoose.model('Salada', saladaSchema);

// ===========================================================================
// 4. Middlewares globais
app.use(cors());
app.use(express.json({ limit: '10mb' })); // aumenta limite pra base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

////////////////////////////////////////////////////////////////////////////////
// ====================== ROTAS PIZZA ========================================
// POST /api/pizzas
app.post('/api/pizzas', async (req, res) => {
  try {
    const { nome, ingredientes, preco_pequeno, preco_medio, preco_grande, imagem } = req.body;
    
    const pizza = new Pizza({
      nome,
      ingredientes,
      preco: {
        pequeno: preco_pequeno || '',
        medio:   preco_medio   || '',
        grande:  preco_grande  || ''
      },
      imagem: imagem || ''
    });

    await pizza.save();
    res.status(201).json({ message: 'Pizza salva com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pizzas
app.get('/api/pizzas', async (_, res) => {
  try {
    const pizzas = await Pizza.find();
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pizzas'});
  }
});

////////////////////////////////////////////////////////////////////////////////
// ====================== ROTAS BEBIDA ========================================
app.post('/api/bebidas', async (req, res) => {
  try {
    const { nome, ingredientes, preco, imagem } = req.body;
    const bebida = new Bebida({ nome, ingredientes, preco, imagem: imagem || '' });
    await bebida.save();
    res.status(201).json({ message: 'Bebida salva com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bebidas', async (_, res) => {
  const bebidas = await Bebida.find();
  res.json(bebidas);
});

////////////////////////////////////////////////////////////////////////////////
// ====================== ROTAS SOBREMESAS ====================================
app.post('/api/sobremesas', async (req, res) => {
  try {
    const { nome, ingredientes, preco, imagem } = req.body;
    const sobremesa = new Sobremesa({ nome, ingredientes, preco, imagem: imagem || '' });
    await sobremesa.save();
    res.status(201).json({ message: 'Sobremesa cadastrada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sobremesas', async (_, res) => {
  const sobremesas = await Sobremesa.find();
  res.json(sobremesas);
});

////////////////////////////////////////////////////////////////////////////////
// ====================== ROTAS SALADA ========================================
app.post('/api/saladas', async (req, res) => {
  try {
    const { nome, ingredientes, preco, imagem } = req.body;
    const salada = new Salada({ nome, ingredientes, preco, imagem: imagem || '' });
    await salada.save();
    res.status(201).json({ message: 'Salada cadastrada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/saladas', async (_, res) => {
  const saladas = await Salada.find();
  res.json(saladas);
});

////////////////////////////////////////////////////////////////////////////////
// ✅ Rota de teste
app.get('/', (req, res) => {
  res.send('API ViSa Pizzaria online!');
  console.log(`Ping recebido - servidor está ativo!`);
});

// 9. Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

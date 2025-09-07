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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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
// ===========================================================================
// 3B. Bebida (NOVO)
const bebidaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,   // descrição opcional
  preco: String,          // ex.: '8.00'  (use objeto se quiser tamanhos)
  imagem: String
});
const Bebida = mongoose.model('Bebida', bebidaSchema);
// ===========================================================================
// 3C. Sobremesa (NOVO)
const sobremesaSchema = new mongoose.Schema({
  nome: String,
  ingredientes: String,   // descrição opcional
  preco: String,          // ex.: '8.00'  (use objeto se quiser tamanhos)
  imagem: String
});
const Sobremesa = mongoose.model('Sobremesa', sobremesaSchema);
// ===========================================================================
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

////////////////////////////////////////////////////////////////////////////////

// ====================== ROTAS PIZZA ========================================
// POST /api/pizzas
app.post('/api/pizzas', async (req, res) => {
  try {
    const { nome, ingredientes, preco_pequeno, preco_medio, preco_grande, base64_imagem } = req.body;
    
    const pizza = new Pizza({
      nome,
      ingredientes,
      preco: {
        pequeno: preco_pequeno || '',
        medio:   preco_medio   || '',
        grande:  preco_grande  || ''
      },
      imagem: base64_imagem || ''
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

// ====================== ROTAS BEBIDA ===============================
// POST /api/bebidas
app.post('/api/bebidas', async (req, res) => {
  try {
    const { nome, ingredientes, preco, base64_imagem } = req.body;
    const bebida = new Bebida({
      nome,
      ingredientes,
      preco,
      imagem: base64_imagem || ''
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

////////////////////////////////////////////////////////////////////////////////

// ====================== ROTAS BEBIDA (NOVAS) ===============================
app.post('/api/saladas', async (req, res) => {
  try {
    const { nome, ingredientes, preco, base64_imagem } = req.body;
    const salada = new Salada({
      nome,
      ingredientes,
      preco,
      imagem: base64_imagem || ''
   });

    await salada.save();
    res.status(201).json({ message: 'Salada Cadastrada com Sucesso!'});
  } catch (err) {
      res.status(500).json({error: err.message});
    }
  })
// GET /api/saladas
app.get('/api/saladas', async (_, res) => {
  const saladas = await Salada.find();
  res.json(saladas);
  });
////////////////////////////////////////////////////////////////////////////////

// ✅Rota de teste para verificar se o servidor esta rodando
app.get('/', (req, res) => {
  res.send('API ViSa Pizzaria online!');
  console.log(`Ping recebido - servidor está ativo!`);
});

//tambem foi criei um monitor no
//https://dashboard.uptimerobot.com/monitors com checagem a cada 5 minutos
//como funciona?
//uptimerobot
//envia uma requisição a render
//aguarda resposta
//verifica o tempo de resposta
//obs.: essa requisição já da uma despertada no render mas como nao estava 
//sendo suficiente criamos o codigo acima => // ✅Rota de teste para verificar se o servidor esta rodando




// 9. Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

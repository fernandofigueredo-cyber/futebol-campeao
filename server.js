const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve os arquivos do site (index.html, images, admin, etc.)
app.use(express.static('.'));

// Rota do placar (substitui a Netlify Function)
app.get('/api/placar', async (req, res) => {
  try {
    // Cole aqui a lógica do seu netlify/functions/placar.js
    res.json({ mensagem: 'Placar funcionando!' });
  } catch (err) {
    res.status(500).json({ erro: 'Falha ao buscar placar' });
  }
});

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

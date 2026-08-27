const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve os arquivos do site (index.html, images, admin, etc.)
app.use(express.static('.'));

// Lógica do placar (convertida da Netlify Function)
async function buscarPlacar(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY;

  try {
    const resposta = await fetch(
      `https://v3.football.api-sports.io/fixtures?live=all`,
      { headers: { "x-apisports-key": API_KEY } }
    );
    const dados = await resposta.json();

    const jogos = (dados.response || []).slice(0, 20).map(j => ({
      time1: j.teams.home.name,
      time2: j.teams.away.name,
      placar: `${j.goals.home ?? 0}–${j.goals.away ?? 0}`,
      status: j.fixture.status.short === "FT" ? "Encerrado" : `Ao vivo · ${j.fixture.status.elapsed || 0}'`,
      campeonato: j.league.name
    }));

    res.set("Cache-Control", "public, max-age=60");
    res.json({ jogos });
  } catch (erro) {
    res.json({ jogos: [], erro: "Não foi possível buscar os jogos agora." });
  }
}

// Responde nas DUAS rotas — assim você nem precisa mexer no HTML
app.get('/api/placar', buscarPlacar);
app.get('/.netlify/functions/placar', buscarPlacar);

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

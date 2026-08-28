const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve os arquivos do site (index.html, images, admin, etc.)
app.use(express.static('.'));

// Placar via API pública da ESPN (sem chave, sem conta, sem suspensão)
async function buscarPlacar(req, res) {
  try {
    const ligas = ['bra.1', 'bra.2']; // Brasileirão Série A e B
    const resultados = await Promise.all(
      ligas.map(liga =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${liga}/scoreboard`)
          .then(r => r.json())
      )
    );

    const jogos = resultados.flatMap(dados =>
      (dados.events || []).map(e => {
        const comp = e.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        const st = comp.status.type;
        return {
          time1: home.team.displayName,
          time2: away.team.displayName,
          placar: `${home.score ?? 0}–${away.score ?? 0}`,
          status: st.state === 'in'
            ? `Ao vivo · ${comp.status.displayClock || ''}`
            : st.completed ? 'Encerrado' : st.shortDetail,
          campeonato: dados.leagues[0].name
        };
      })
    ).slice(0, 20);

    res.set("Cache-Control", "public, max-age=60");
    res.json({ jogos });
  } catch (erro) {
    res.json({ jogos: [], erro: "Não foi possível buscar os jogos agora." });
  }
}

// Responde nas DUAS rotas — não precisa mexer no HTML
app.get('/api/placar', buscarPlacar);
app.get('/.netlify/functions/placar', buscarPlacar);

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('.'));

// Traduz o nome dos campeonatos
function nomeCampeonato(nome) {
  const mapa = {
    'Brazilian Serie A': 'Brasileirão Série A',
    'Brazilian Serie B': 'Brasileirão Série B',
    'Copa do Brasil': 'Copa do Brasil',
    'CONMEBOL Libertadores': 'Libertadores'
  };
  return mapa[nome] || nome;
}

// Formata data/hora do jogo em pt-BR (fuso de Brasília)
function dataJogo(dataISO) {
  const data = new Date(dataISO);
  const tz = { timeZone: 'America/Sao_Paulo' };
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', ...tz });

  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);

  const dia = d => d.toLocaleDateString('pt-BR', tz);

  if (dia(data) === dia(hoje)) return `Hoje · ${hora}`;
  if (dia(data) === dia(amanha)) return `Amanhã · ${hora}`;

  const semana = data.toLocaleDateString('pt-BR', { weekday: 'short', ...tz });
  return `${semana} · ${hora}`;
}

async function buscarPlacar(req, res) {
  try {
    const ligas = ['bra.1', 'bra.2'];
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
            : st.completed ? 'Encerrado' : dataJogo(e.date),
          campeonato: nomeCampeonato(dados.leagues[0].name)
        };
      })
    ).slice(0, 20);

    res.set("Cache-Control", "public, max-age=60");
    res.json({ jogos });
  } catch (erro) {
    res.json({ jogos: [], erro: "Não foi possível buscar os jogos agora." });
  }
}

app.get('/api/placar', buscarPlacar);
app.get('/.netlify/functions/placar', buscarPlacar);

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

exports.handler = async function () {
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({ jogos })
    };
  } catch (erro) {
    return {
      statusCode: 200,
      body: JSON.stringify({ jogos: [], erro: "Não foi possível buscar os jogos agora." })
    };
  }
};

exports.handler = async function () {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const BRASILEIRAO_ID = 71; // Brasileirão Série A na API-Football
  const temporada = new Date().getFullYear();

  try {
    const resposta = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${BRASILEIRAO_ID}&season=${temporada}&live=all`,
      { headers: { "x-apisports-key": API_KEY } }
    );
    const dados = await resposta.json();

    const jogos = (dados.response || []).map(j => ({
      time1: j.teams.home.name,
      time2: j.teams.away.name,
      placar: `${j.goals.home ?? 0}–${j.goals.away ?? 0}`,
      status: j.fixture.status.short === "FT" ? "Encerrado" : `Ao vivo · ${j.fixture.status.elapsed || 0}'`
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

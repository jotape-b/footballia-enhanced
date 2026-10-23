async function getTeamId(team) {
    const proxyUrl = new URL("https://api-proxy.jpepeu2005.workers.dev");
    const route = `/teams/search/${team}`;

    const url = new URL(`${proxyUrl}${route}`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    const teamId = data.data[0].id;
    return teamId;
}

export async function getFixtureStats(team, date) {
    const teamId = await getTeamId(team);

    const url = new URL("https://api-proxy.jpepeu2005.workers.dev");
    url.pathname = `/fixtures/between/${date}/${date}/${teamId}`;
    url.searchParams.set("include", "statistics");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}
const apiUrl = "https://api.sportmonks.com/v3/football";

export async function getTeamId(team) {
    const route = `${apiUrl}/teams/search/${team}?api_token=${TOKEN}`;
    try {
        const response = await fetch(route);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        const teamId = data.data[0].id;
        return teamId;
    } catch (error) {
        console.error(error.message);
    }
}
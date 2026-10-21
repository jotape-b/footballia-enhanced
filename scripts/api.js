const apiUrl = "https://v3.football.api-sports.io";
const myHeaders = new Headers();
myHeaders.append("x-apisports-key", "c18c8bafab0be83ce8320537309d240a");
const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

export async function getTeamId(team) {
    const route = `${apiUrl}/teams?search=${team}`;
    try {
        const response = await fetch(route, requestOptions);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        const teamId = data.response[0].team.id;
        return teamId;
    } catch (error) {
        console.error(error.message);
    }
}
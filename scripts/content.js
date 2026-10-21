const teamsString = document.querySelector("div.description.m-t.blog-entry h1").textContent;
const playingDate = document.querySelector('[itemprop="startDate"]').getAttribute('content');

const teams = findTeams(teamsString);
const filteredData = {
    home: teams[0],
    away: teams[1],
    date: playingDate
};

chrome.runtime.sendMessage(
    { type: "API_SEND", payload: filteredData },
    (res) => {
        if (chrome.runtime.lastError) {
            console.error("Communication error:", chrome.runtime.lastError);
            return;
        }
        console.log("Status:", res.status);
    }
);

function findTeams(teamsString) {
    const teams = teamsString.split(/\s+vs\.?\s+/i);
    const team1 = teams[0].trim();
    const team2 = filterSecondTeam(teams[1].trim())
    return [team1, team2];
}

function filterSecondTeam(stringToFilter) {
    filterAux = stringToFilter.split(' ');
    let lastUppercaseIndex = 0;

    filterAux.forEach((word, index) => {
        if (/^\p{Lu}/u.test(word)) {
            lastUppercaseIndex = index;
        }
    });

    const team2 = filterAux.slice(0, lastUppercaseIndex + 1).join(' ');
    return team2;
}

//Atlético Mineiro vs. Goiás EC full match Campeonato Brasileiro 2004
/*
Remover "vs."
Separar mandante e visitante
Remover "full match"
Separar competição
Separar temporada
*/
//https://footballia.eu/pt/jogos-completos/atletico-mineiro-goias-ec
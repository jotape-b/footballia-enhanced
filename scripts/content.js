let teamsString = document.querySelector("div.description.m-t.blog-entry h1").textContent;
let competitionString = document.querySelector("div.description.m-t.blog-entry h2").textContent;

const teams = findTeams(teamsString);
const match = findCompetitionAndSeason(competitionString);
const filteredData = teams.concat(match);
console.log(filteredData[0]);
console.log(filteredData[1]);
console.log(filteredData[2]);
console.log(filteredData[3]);


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

function findCompetitionAndSeason(competitionString) {
    const match = competitionString.match(/^(.*?)\s+(\d{4})$/);
    const filteredMatch = [match[1], match[2]];
    return filteredMatch;
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
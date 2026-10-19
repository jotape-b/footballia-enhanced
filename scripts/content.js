let teamsString = document.querySelector("div.description.m-t.blog-entry h1").textContent;
let competitionString = document.querySelector("div.description.m-t.blog-entry h2").textContent;

const teams = teamsString.split(/\s+vs\.?\s+/i);
const team1 = teams[0].trim();
const team2 = filterSecondTeam(teams[1].trim())

function filterSecondTeam(stringToFilter){
    filterAux = stringToFilter.split(' ');
    let lastUppercaseIndex = 0;

    filterAux.forEach((word, index) => {
        if(/^\p{Lu}/u.test(word)){
            lastUppercaseIndex = index;
        }
    });

    const team2 = filterAux.slice(0, lastUppercaseIndex + 1).join(' ');
    return team2;
}

console.log(team1);
console.log(team2);

const match = competitionString.match(/^(.*?)\s+(\d{4})$/);
const competicao = match[1];
const ano = match[2];

console.log(competicao);
console.log(ano);

//Atlético Mineiro vs. Goiás EC full match Campeonato Brasileiro 2004
/* 
Remover "vs."
Separar mandante e visitante
Remover "full match"
Separar competição
Separar temporada
*/
//https://footballia.eu/pt/jogos-completos/atletico-mineiro-goias-ec
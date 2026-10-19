console.log("ON");
let teams = document.querySelector("div.description.m-t.blog-entry h1").textContent;
let competition = document.querySelector("div.description.m-t.blog-entry h2").textContent;
console.log(teams + " " + competition);

const partes = teams.split(/\s+vs\.?\s+/i);
const time1 = partes[0].trim();

const resto = partes[1].trim();
const palavras = resto.split(' ');

let ultimoIndiceMaiusculo = 0;

palavras.forEach((palavra, index) => {
    if(/^\p{Lu}/u.test(palavra)){
        ultimoIndiceMaiusculo = index;
    }
});

const time2 = palavras.slice(0, ultimoIndiceMaiusculo + 1).join(' ');

console.log(time1);
console.log(time2);

//Atlético Mineiro vs. Goiás EC full match Campeonato Brasileiro 2004
/* 
Remover "vs."
Separar mandante e visitante
Remover "full match"
Separar competição
Separar temporada
*/
//https://footballia.eu/pt/jogos-completos/atletico-mineiro-goias-ec
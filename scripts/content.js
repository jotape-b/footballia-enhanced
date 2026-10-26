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
        console.log("API response:", res.data);
        renderFixtureStats(res.data, filteredData.home, filteredData.away);
    }
);

function renderFixtureStats(data, home, away) {
    const targetElement = document.querySelector("#match > div.row");

    const statsContainer = document.createElement("div");
    statsContainer.id = "custom-injected-stats";

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
        <tr>
            <th>Statistic</th>
            <th>${home}</th>
            <th>${away}</th>
        </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");
    const groupedStats = new Map();

    data.data[0].statistics.forEach(stat => {
        const statName = stat.type.name;

        if (!groupedStats.has(statName)) {
            groupedStats.set(statName, { home: 0, away: 0 });
        }

        if (stat.location === "home") {
            groupedStats.get(statName).home = stat.data.value;
        } else if (stat.location === "away") {
            groupedStats.get(statName).away = stat.data.value;
        }
    });

    groupedStats.forEach((values, statName) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${statName}</td>
            <td>${values.home}</td>
            <td>${values.away}</td>
        `;
        tbody.appendChild(row);
    });

    statsContainer.appendChild(table);
    targetElement.appendChild(statsContainer);
}

function findTeams(teamsString) {
    const teams = teamsString.split(/\s+vs\.?\s+/i);
    const team1 = normalizeName(teams[0]);
    console.log(team1);
    const team2 = filterSecondTeam(teams[1].trim());
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

    const rawTeam2 = filterAux.slice(0, lastUppercaseIndex + 1).join(' ');
    const team2 = normalizeName(rawTeam2);
    return team2;
}

function normalizeName(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}
//https://footballia.net/fr/matchs-complets/fc-kobenhavn-brondby-if
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
        console.log("API response:", res.data.data[0]);
        renderMatchDashboard(res.data.data[0]);
    }
);

function renderMatchDashboard(apiData) {
    // 1. Target the right column instead of the raw row
    const parentRow = document.querySelector('#match > div.row');
    if (!parentRow) {
        console.error('Target element "#match > div.row" not found.');
        return;
    }

    // Grabs the last child of the row, which is typically the right sidebar containing the social icons
    const targetContainer = parentRow.lastElementChild;

    // 2. Extract Teams
    const homeTeam = apiData.participants.find(p => p.meta.location === 'home');
    const awayTeam = apiData.participants.find(p => p.meta.location === 'away');

    // 3. Process Statistics
    const statsMap = {};
    if (apiData.statistics) {
        apiData.statistics.forEach(stat => {
            const statName = stat.type.name;
            if (!statsMap[statName]) statsMap[statName] = { home: 0, away: 0 };
            statsMap[statName][stat.location] = stat.data.value;
        });
    }

    let statsHTML = '<div class="stats-wrapper">';
    for (const [statName, values] of Object.entries(statsMap)) {
        const total = (values.home + values.away) || 1;
        const homePercent = (values.home / total) * 100;
        const awayPercent = (values.away / total) * 100;

        statsHTML += `
            <div class="stat-item">
                <div class="stat-labels">
                    <span class="stat-value">${values.home}</span>
                    <span class="stat-title">${statName}</span>
                    <span class="stat-value">${values.away}</span>
                </div>
                <div class="stat-bars">
                    <div class="bar-home-bg"><div class="bar-home-fill" style="width: ${homePercent}%"></div></div>
                    <div class="bar-away-bg"><div class="bar-away-fill" style="width: ${awayPercent}%"></div></div>
                </div>
            </div>
        `;
    }
    statsHTML += '</div>';

    // 4. Process Sidelined (Preview)
    const homeSidelined = apiData.sidelined ? apiData.sidelined.filter(s => s.participant_id === homeTeam.id) : [];
    const awaySidelined = apiData.sidelined ? apiData.sidelined.filter(s => s.participant_id === awayTeam.id) : [];

    const createPlayerCard = (playerObj) => `
        <div class="sidelined-card">
            <img src="${playerObj.sideline.player.image_path}" alt="Player" class="player-avatar" onerror="this.style.display='none'">
            <div class="player-info">
                <div class="player-name">${playerObj.sideline.player.display_name}</div>
                <div class="injury-type">${playerObj.sideline.type.name}</div>
            </div>
        </div>
    `;

    const sidelinedHTML = `
        <div class="sidelined-layout">
            <div class="team-column">
                <div class="column-header">${homeTeam.short_code}: ${homeSidelined.length}</div>
                ${homeSidelined.map(createPlayerCard).join('')}
            </div>
            <div class="team-column">
                <div class="column-header">${awayTeam.short_code}: ${awaySidelined.length}</div>
                ${awaySidelined.map(createPlayerCard).join('')}
            </div>
        </div>
    `;

    // 5. Process Events
    const sortedEvents = apiData.events ? apiData.events.sort((a, b) => a.minute - b.minute) : [];
    let eventsHTML = '<div class="events-wrapper">';
    sortedEvents.forEach(event => {
        const isHome = event.participant_id === homeTeam.id;
        const relatedPlayerStr = event.related_player_name ? ` ➔ ${event.related_player_name}` : '';

        eventsHTML += `
            <div class="event-row ${isHome ? 'home-event' : 'away-event'}">
                <div class="event-minute">${event.minute}'</div>
                <div class="event-details">
                    <div class="event-players">${event.player_name}${relatedPlayerStr}</div>
                    <div class="event-type">${event.type.name}</div>
                </div>
            </div>
        `;
    });
    eventsHTML += '</div>';

    // 6. Responsive CSS Styles for Sidebars
    const styles = `
        .dashboard-wrapper { width: 100%; max-width: 100%; margin-top: 20px; box-sizing: border-box; clear: both; }
        .match-dashboard { font-family: sans-serif; background: #fff; padding: 15px; border-radius: 8px; width: 100%; box-sizing: border-box; border: 1px solid #eef0f2; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .tab-navigation { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .tab-btn { flex: 1 1 auto; background: #f8f9fa; border: 1px solid #ddd; padding: 6px 10px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 600; color: #0b132b; transition: 0.2s; text-align: center; }
        .tab-btn.active { background: #0b132b; color: #fff; border-color: #0b132b; }
        .tab-content { display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.3s; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Stats CSS */
        .stat-item { margin-bottom: 15px; }
        .stat-labels { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; font-weight: bold; }
        .stat-title { font-style: italic; color: #777; font-weight: normal; font-size: 11px; }
        .stat-bars { display: flex; gap: 4px; height: 5px; }
        .bar-home-bg, .bar-away-bg { flex: 1; background: #eee; display: flex; border-radius: 4px; overflow: hidden; }
        .bar-home-bg { justify-content: flex-end; }
        .bar-home-fill { background: #00a8ff; height: 100%; }
        .bar-away-fill { background: #0b132b; height: 100%; }
        
        /* Sidelined CSS */
        .sidelined-layout { display: flex; flex-direction: column; gap: 15px; }
        .team-column { flex: 1; }
        .column-header { text-align: left; color: #555; margin-bottom: 10px; font-size: 13px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .sidelined-card { display: flex; align-items: center; padding: 8px; border: 1px solid #f0f0f0; border-radius: 6px; margin-bottom: 8px; background: #fafafa; }
        .player-avatar { width: 32px; height: 32px; border-radius: 50%; margin-right: 12px; object-fit: cover; background: #ddd; }
        .player-name { font-weight: bold; font-size: 12px; color: #333; }
        .injury-type { font-size: 11px; color: #888; margin-top: 2px; }
        
        /* Events CSS */
        .events-wrapper { max-height: 400px; overflow-y: auto; padding-right: 5px; }
        .event-row { display: flex; align-items: center; padding: 10px; border: 1px solid #f0f0f0; margin-bottom: 8px; border-radius: 6px; background: #fafafa; }
        .home-event { flex-direction: row; }
        .away-event { flex-direction: row-reverse; text-align: right; }
        .event-minute { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid #00a8ff; border-radius: 50%; color: #00a8ff; font-weight: bold; font-size: 12px; margin: 0 10px; flex-shrink: 0; }
        .event-players { font-weight: bold; font-size: 12px; color: #333; }
        .event-type { font-size: 11px; color: #888; margin-top: 2px; }
        
        /* Scrollbar customization for events */
        .events-wrapper::-webkit-scrollbar { width: 4px; }
        .events-wrapper::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
    `;

    // 7. Build the final DOM structure
    const dashboardWrapper = document.createElement('div');
    dashboardWrapper.className = 'dashboard-wrapper';

    dashboardWrapper.innerHTML = `
        <style>${styles}</style>
        <div class="match-dashboard">
            <div class="tab-navigation">
                <button class="tab-btn active" data-target="tab-events">Events</button>
                <button class="tab-btn" data-target="tab-preview">Preview</button>
                <button class="tab-btn" data-target="tab-stats">Stats</button>
            </div>

            <div id="tab-events" class="tab-content active">
                ${eventsHTML}
            </div>

            <div id="tab-preview" class="tab-content">
                ${sidelinedHTML}
            </div>

            <div id="tab-stats" class="tab-content">
                ${statsHTML}
            </div>
        </div>
    `;

    // Appends to the right column, placing it neatly underneath the social icons
    targetContainer.appendChild(dashboardWrapper);

    // 8. Attach Tab Switching Logic
    const tabButtons = dashboardWrapper.querySelectorAll('.tab-btn');
    const tabContents = dashboardWrapper.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            const targetId = e.target.getAttribute('data-target');
            e.target.classList.add('active');
            dashboardWrapper.querySelector('#' + targetId).classList.add('active');
        });
    });
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
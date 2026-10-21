/*
chrome.runtime.onMessage.addListener((msg, remetente, sendRes) => {
    if (msg.type === "API_SEND") {
        const url = "https://jsonplaceholder.typicode.com/posts";
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(msg.payload)
        })
            .then(res => res.json())
            .then(APIData => {
                chrome.storage.local.set({ lastAPIResponse: APIData }, () => {
                    sendRes({ status: "success" });
                });
            })
            .catch(err => {
                console.error("Fetch error:", err);
                sendRes({ status: "error", error: err.toString() });
            });
        return true;
    }
});
function getFixture();
function getMatchStats();

fetch("https://v3.football.api-sports.io/leagues", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
*/

const url = "https://v3.football.api-sports.io";
const myHeaders = new Headers();
myHeaders.append("x-apisports-key", "c18c8bafab0be83ce8320537309d240a");
const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
    if (msg.type === "API_SEND") {
        getTeamId(msg.payload.home)
            .then(APIData => {
                chrome.storage.local.set({ lastApiResponse: APIData }, () => {
                    sendRes({ status: "success", data: APIData });
                });
            })
            .catch(err => {
                console.error("Error in GET:", err);
                sendRes({ status: "error", error: err.message });
            });
        return true;
    }
});

async function getTeamId(team) {
    const params = new URLSearchParams();
    params.append("search", team)
    const route = `${url}/teams?${params}`;
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
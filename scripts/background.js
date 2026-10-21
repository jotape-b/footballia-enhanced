
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
/*
const myHeaders = new Headers();
myHeaders.append("x-apisports-key", "XxXxXxXxXxXxXxXxXxXxXxXx");

const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

async function getTeam(team){
    const params = new URLSearchParams();
    params.append("search", team)
    const url = `https://v3.football.api-sports.io/teams?${params}`;
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error){
        console.error(error.message);
    }
}

function getFixture();
function getMatchStats();

fetch("https://v3.football.api-sports.io/leagues", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
*/
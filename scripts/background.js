import { getFixtureStats } from './api.js'

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
    if (msg.type === "API_SEND") {
        getFixtureStats(msg.payload.home, msg.payload.date)
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
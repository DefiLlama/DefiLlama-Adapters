const https = require('https');

const VAULT_ADDRESS = "0x1e37a337ed460039d1b15bd3bc489de789768d5e";
const API_URL = "https://api.hyperliquid.xyz/info";

async function fetchTVL() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            type: "vaultDetails",
            vaultAddress: VAULT_ADDRESS
        });

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        };

        const req = https.request(API_URL, options, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                const response = JSON.parse(body);

                let tvlAmount = 0;
                if (response.portfolio && response.portfolio.length > 0) {
                    const accountHistory = response.portfolio.find(p => p[0] === "allTime");
                    if (accountHistory && accountHistory[1].accountValueHistory.length > 0) {
                        const lastEntry = accountHistory[1].accountValueHistory.slice(-1)[0];
                        tvlAmount = parseFloat(lastEntry[1]);
                    }
                }
                resolve({ "usd-coin": tvlAmount });
            });
        });


        req.on("error", (error) => {
            reject(new Error("Error fetching TVL:", error));
        });

        req.write(data);
        req.end();
    });
}

async function tvl() {
    return await fetchTVL();
}

module.exports = {
    methodology: "TVL is calculated directly from Hyperliquid API by getting GrowiHF Vault TVL.",
    timetravel: false,
    hyperliquid: { tvl },
};
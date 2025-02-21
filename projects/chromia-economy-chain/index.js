const { get } = require('../helper/http');

async function tvl() {
    const apiUrl = "https://system.chromaway.com:7740/query/15C0CA99BEE60A3B23829968771C50E491BD00D2E3AE448580CD48A8D71E7BBA?type=staking_total_stake_on_network&network=2";

    try {
        const response = await get(apiUrl);

        // Convert from raw value (6 decimal places)
        const totalStakedCHR = response / 1e6;  

        return {
            "chromaway": totalStakedCHR,
        };
    } catch (error) {
        console.error("Error fetching Chromia staking data:", error);
        return {};
    }
}

module.exports = {
    timetravel: false, // Chromia may not support historical queries
    methodology: "Fetches total staked CHR from the Chromia Economy Chain API.",
    chromia: {
        tvl,
    },
};

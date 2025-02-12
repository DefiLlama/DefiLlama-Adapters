const axios = require("axios");

module.exports = {
    methodology: "Sums the total supplies of thePAC's issued tokens."
}

const config = {
    hashkey: {
        PacARB: "0x7f69a2ba074dA1Fd422D994ee05C4B8CA83A32C7",
    }
}

async function getTotalSupply(api) {
    return await api.call({
        abi: "erc20:totalSupply",
        target: config.hashkey.PacARB,
    })
}

async function fetchUnClaimedToken() {
    try {
        const response = await axios.get("https://manager.thepac.xyz/api/unClaimed/PacARB");
        return response.data.data.unClaimed
    } catch (error) {
        console.error("Error fetching backend data:", error);
        return "0";
    }
}

async function tvl(api) {
    const [supply, unClaimed] = await Promise.all([
        getTotalSupply(api),
        fetchUnClaimedToken(),
    ]);

    const totalTokens = Number(supply) + Number(unClaimed);

    api.addTokens(config.hashkey.PacARB, totalTokens / 1e18);
}

module.exports = {
    hashkey: {
        tvl
    }
};


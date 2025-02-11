const { ethers } = require("ethers");
const axios = require("axios");

module.exports = {
    methodology: "Sums the total supplies of Pac's issued tokens."
}

const config = {
    hashkey: {
        PacARB: "0x7f69a2ba074dA1Fd422D994ee05C4B8CA83A32C7",
        USDT: "0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029"
    }
}

async function getTotalSupply() {
    try {
        const provider = new ethers.JsonRpcProvider("https://mainnet.hsk.xyz");
        const contract = new ethers.Contract(
            config.hashkey.PacARB,
            ["function totalSupply() view returns (uint256)"],
            provider
        );
        const supply = await contract.totalSupply();
        return ethers.formatUnits(supply, 18);
    } catch (error) {
        console.error("Error in getTotalSupply:", error);
        return "0";
    }
}

async function fetchBackendData() {
    try {
        const response = await axios.get("https://manager.thepac.xyz/api/unClaimed/PacARB");
        return response.data.data.unClaimed;
    } catch (error) {
        console.error("Error fetching backend data:", error);
        return "0";
    }
}

async function tvl(api) {
    const [supply, unClaimed] = await Promise.all([
        getTotalSupply(),
        fetchBackendData(),
    ]);

    const unclaimed = ethers.formatUnits(unClaimed, 18);
    const totalTokens = Number(supply) + Number(unclaimed);

    api.addTokens(config.hashkey.PacARB, totalTokens);
}

module.exports = {
    hashkey: {
        tvl
    }
};


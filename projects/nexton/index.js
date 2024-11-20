
const { call, getTokenRates } = require("../helper/chain/ton");

const contractAddress = "EQBED_4VLQC-SRdrVCtmcmwO7PtnvdLSRFRYNaGIZBqpaQHQ";
const nxton = {
    token: "0:9d123d5d121efaf9069c737f19447d9e1adab2a7ee747cedffd3004a17c1ca4f",
    name: "NxTON",
    decimals: 9,
};

const getTVL = async (api)=> {
    const tonStaked = (await call({
        target: contractAddress,
        abi: "tonStaked"
    }))[0];
    const nxtonStaked = (await call({
        target: contractAddress,
        abi: "nxtonStaked"
    }))[0];

    const tokens = ["TON", nxton.token];
    const priceRates = await getTokenRates({tokens});
    
    api.addUSDValue(tonStaked * (priceRates["TON"]/1e9 || 0));
    api.addUSDValue(nxtonStaked * (priceRates[nxton.token]/Math.pow(10, nxton.decimals) || 0));
}

module.exports = {
    // timetravel: false,
    // misrepresentedTokens: true,
    ton: {
        staking: getTVL,
        tvl : ()=> {}
    }
}
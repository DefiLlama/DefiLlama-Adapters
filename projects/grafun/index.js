const ethers = require("ethers");

const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org/';
const TOKEN_SALE_FACTORY = "0x8341b19a2A602eAE0f22633b6da12E1B016E6451";

async function getBscTVL() {
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);

    const balanceWei = await provider.getBalance(TOKEN_SALE_FACTORY);
    const balanceBNB = ethers.formatEther(balanceWei);

    return { binancecoin: balanceBNB };
}

module.exports = {
    methodology: "TVL is calculated by aggregating the market value of BNB tokens held within the Token Sale Factory smart contract.",
    start: 42593135,
    bsc: {
        tvl: getBscTVL
    }
};

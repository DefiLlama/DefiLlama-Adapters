const {toUSDTBalances} = require("../helper/balances");
const {default: BigNumber} = require("bignumber.js");

const homeVault = "0x717882AB8e82aFD999C7E5bEA87E07eC78D82C62"

async function tvl(api) {
    const asset = await api.call({
        target: homeVault,
        abi: 'uint256:totalAssets'
    })
    const vaultTVL = BigNumber(asset).div(1e18).toFixed(0)
    return toUSDTBalances(vaultTVL)
}

module.exports = {
    methodology: "We calculate TVL based on the total managed assets (in USD) of our home proxy contracts, accounting for all assets and LP tokens",
    polygon: {
        tvl
    },
};

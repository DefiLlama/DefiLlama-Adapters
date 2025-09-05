const sdk = require("@defillama/sdk");
const config = require("./config");

async function tvl(api) {
    const balances = {};

    const totalAssets = await api.call({
        abi: "function totalAssets() public view returns(uint256)",
        target: config.SUPERLOOP_VAULT,
    });

    sdk.util.sumSingleBalance(balances, config.WXTZ, totalAssets, api.chain);

    return balances;
}

module.exports = {
    etlk: { tvl }
}

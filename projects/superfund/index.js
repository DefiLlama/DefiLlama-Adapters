const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const config = {
    "SUPERFUND_VAULT": "0x10076ed296571ce4fde5b1fdf0eb9014a880e47b",
    "USDC": ADDRESSES.base.USDC
};

async function tvl(api) {
    const balances = {};

    const totalAssets = await api.call({
        abi: "function totalAssets() public view returns(uint256)",
        target: config.SUPERFUND_VAULT,
    });

    sdk.util.sumSingleBalance(balances, config.USDC, totalAssets, api.chain);

    return balances;
}

module.exports = {
    base: { tvl }
}

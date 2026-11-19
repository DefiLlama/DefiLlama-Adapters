const sdk = require("@defillama/sdk");
const config = {
    "APE_COIN_STAKE_VAULT": "0xAfc2BE801F55Cb0ee2D65C11EB14F88cbD6C576C",
    "APE_COIN": "0x4d224452801ACEd8B2F0aebE155379bb5D594381"
}

async function tvl(api) {
    const balances = {};

    const totalAssets = await api.call({
        abi: "function totalAssets() public view returns(uint256)",
        target: config.APE_COIN_STAKE_VAULT,
    });

    sdk.util.sumSingleBalance(balances, config.APE_COIN, totalAssets, api.chain);

    return balances;
}

module.exports = {
    ethereum: { tvl }
}
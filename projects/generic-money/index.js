const sdk = require("@defillama/sdk");
const vaultsToAssets = [
    { vault: "0x4825eFF24F9B7b76EEAFA2ecc6A1D5dFCb3c1c3f", asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }, // USDC
    { vault: "0xB8280955aE7b5207AF4CDbdCd775135Bd38157fE", asset: "0xdAC17F958D2ee523a2206206994597C13D831ec7" }, // USDT
    { vault: "0x6133dA4Cd25773Ebd38542a8aCEF8F94cA89892A", asset: "0xdC035D45d973E3EC169d2276DDab16f1e407384F" }  // USDS
]


async function tvl(api) {
    const balances = {};

    for (const { vault, asset } of vaultsToAssets) {
        const totalAssets = await api.call({
            abi: "function totalAssets() public view returns(uint256)",
            target: vault,
        });

        sdk.util.sumSingleBalance(balances, asset, totalAssets, api.chain);
    }

    return balances;
}


module.exports = {
    methodology: "TVL counts the total assets on Generic Money's vaults which back gUSD and g-units.",
    ethereum: { tvl },
}
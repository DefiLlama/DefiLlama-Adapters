const { sumTokensExport } = require("../helper/unwrapLPs")

const bUSD0Token = "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0";
const USD0Token = "0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5";
const UZRLendingMarket = "0xa428723eE8ffD87088C36121d72100B43F11fb6A"; // UZR Lending Market (MetaMorpho vault)
const UZRMarketId = "0xa597b5a36f6cc0ede718ba58b2e23f5c747da810bf8e299022d88123ab03340e";
const marketAbi = "function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)";

async function borrowed(api) {
    const marketData = await api.call({ target: UZRLendingMarket, abi: marketAbi, params: [UZRMarketId] });
    api.add(USD0Token, marketData.totalBorrowAssets);
}

module.exports = {
    methodology: "Fira TVL is bonded USD0 (bUSD0) collateral deposited into the UZR vault",
    ethereum: {
        tvl: sumTokensExport({
            tokens: [bUSD0Token],
            owners: [UZRLendingMarket],
            resolveUniV3: false,
        }),
        borrowed,
    },
    doublecounted: true,
};
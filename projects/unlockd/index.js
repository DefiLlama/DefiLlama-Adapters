const sdk = require("@defillama/sdk");
const methodologies = require("../helper/methodologies.js");
const uTokenAbi = {
    "totalAvailableSupply": "function totalAvailableSupply(address) view returns (uint256)",
    "getScaledTotalDebtMarket": "function getScaledTotalDebtMarket(address) view returns (uint256)"
}
const addresses = {
    UTokenVault: "0x25299e9Ec27c242465587B8A2Aa70bcE02636cDA",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}

async function tvl() {
    const reserves = await sdk.api.abi.call({
        target: addresses.UTokenVault,
        params: addresses.USDC,
        abi: uTokenAbi.totalAvailableSupply,
    });

    return {
        [addresses.USDC]: reserves.output
    };
}

async function borrowed() {
    const scaledDebt = await sdk.api.abi.call({
        target: addresses.UTokenVault,
        params: addresses.USDC,
        abi: uTokenAbi.getScaledTotalDebtMarket
    });

    return {
        [addresses.USDC]: scaledDebt.output
    };
}

module.exports = {
    methodology: methodologies.lendingMarket,
    ethereum: {
        tvl,
        borrowed,
    },
};

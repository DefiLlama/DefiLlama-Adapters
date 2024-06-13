const ADDRESSES = require('../helper/coreAssets.json')
const methodologies = require("../helper/methodologies.js");
const uTokenAbi = {
  "totalAvailableSupply": "function totalAvailableSupply(address) view returns (uint256)",
  "getScaledTotalDebtMarket": "function getScaledTotalDebtMarket(address) view returns (uint256)"
}
const addresses = {
  UTokenVault: "0x25299e9Ec27c242465587B8A2Aa70bcE02636cDA",
  USDC: ADDRESSES.ethereum.USDC
}

async function tvl(api) {
  return api.sumTokens({ owner: addresses.UTokenVault, token: addresses.USDC })
}

async function borrowed(api) {
  const scaledDebt = await api.call({
    target: addresses.UTokenVault,
    params: addresses.USDC,
    abi: uTokenAbi.getScaledTotalDebtMarket
  });
  api.add(addresses.USDC, scaledDebt)
}

module.exports = {
  methodology: methodologies.lendingMarket,
  ethereum: {
    tvl,
    borrowed,
  },
};

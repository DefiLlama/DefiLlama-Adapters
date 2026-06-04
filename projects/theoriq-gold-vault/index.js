const VAULTS = ["0x0F54097295E97cE61736bb9a0a1066cDf3e31C8F"];

// Strategies: proof of the collateral held by the vault
const SUB_ACCOUNTS = [
  "0x361339dd6ceCF76AfDadDf35fB41DA58aFA80A94",
  "0xB340C84e534B9455B4cc4177E3789070899370d5",
  "0xfEcd45eFD14e282D802A4C6705068B9f19b70C51",
  "0x9F6F9e1F355958F5c55057E2B63F60b8581CCA18",
];

const tvl = async (api) => {
  return api.erc4626Sum({ calls: VAULTS, tokenAbi: 'address:asset', balanceAbi: 'uint256:getTotalAssets' });
}

module.exports = {
  doublecounted: true,
  methodology: "TVL is the sum of asset balances held by the Theoriq vault.",
  ethereum: { tvl },
};

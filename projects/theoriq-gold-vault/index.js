const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT = "0x0F54097295E97cE61736bb9a0a1066cDf3e31C8F";

const SUB_ACCOUNTS = [
  "0x361339dd6ceCF76AfDadDf35fB41DA58aFA80A94",
  "0xB340C84e534B9455B4cc4177E3789070899370d5",
  "0xfEcd45eFD14e282D802A4C6705068B9f19b70C51",
  "0x9F6F9e1F355958F5c55057E2B63F60b8581CCA18",
];

async function tvl(api) {
  const vaultAsset = await api.call({ abi: 'address:asset', target: VAULT })
  const tokens = [vaultAsset, ADDRESSES.null, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.WETH]
  const owners = [VAULT, ...SUB_ACCOUNTS]
  return sumTokens2({ api, owners, tokens })
}

module.exports = {
  methodology:
    "TVL is the sum of asset balances held by the Theoriq vault and its sub-accounts.",
  ethereum: { tvl },
};

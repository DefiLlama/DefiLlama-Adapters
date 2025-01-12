const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const { sumUnknownTokens } = require("../helper/unknownTokens")

const FindoraStableCoins = {
  BNB_BUSD: ADDRESSES.findora.BUSD_b,
  BNB_USDT: ADDRESSES.findora.USDT_b,
  ETHEREUM_USDC: ADDRESSES.findora.USDC_e,
  ETHEREUM_USDT: ADDRESSES.findora.USDT_e,
};

const FutureSwapContracts = {
  USDF: "0x7cdA16774fA183212889d7221fffF29f8b7e664b",
  Farm: "0x2EC17007a70d2e37DBCEB4EEa05c2e5a5e6B73cA",
};

const abiPools = `function getPools() view returns (tuple(address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accRewardPerShare)[])`;

async function farmStakings(api) {
  const pools = await api.call({ target: FutureSwapContracts.Farm, abi: abiPools, })

  return sumUnknownTokens({ api, tokens: pools.map(i => i.lpToken), owner: FutureSwapContracts.Farm, blacklistedTokens: [FutureSwapContracts.USDF], resolveLP: true, useDefaultCoreAssets: true, })
}

module.exports = {
  findora: {
    start: '2023-02-22', // 2023-02-22 01:26:52 UTC
    methodology: `Sum of liqudities backed USDF; and tokens values staked in the FutureSwap Farm.`,
    tvl: sumTokensExport({
      owner: FutureSwapContracts.USDF,
      tokens: Object.values(FindoraStableCoins),
    }),
    staking: farmStakings,
  },
};

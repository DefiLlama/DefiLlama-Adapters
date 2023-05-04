const { sumTokensExport } = require("../helper/unwrapLPs")
const { sumUnknownTokens } = require("../helper/unknownTokens")

const FindoraStableCoins = {
  BNB_BUSD: "0xE80EB4a234f718eDc5B76Bb442653827D20Ebb2d",
  BNB_USDT: "0x93EDFa31D7ac69999E964DAC9c25Cd6402c75DB3",
  ETHEREUM_USDC: "0x2e8079E0fE49626AF8716fC38aDEa6799065D7f7",
  ETHEREUM_USDT: "0x0632baa26299C9972eD4D9AfFa3FD057A72252Ff",
};

const FutureSwapContracts = {
  USDF: "0x7cdA16774fA183212889d7221fffF29f8b7e664b",
  Farm: "0x2EC17007a70d2e37DBCEB4EEa05c2e5a5e6B73cA",
};

const abiPools = `function getPools() view returns (tuple(address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accRewardPerShare)[])`;

async function farmStakings(timestamp, block, _, { api }) {
  const pools = await api.call({ target: FutureSwapContracts.Farm, abi: abiPools, })

  return sumUnknownTokens({ api, tokens: pools.map(i => i.lpToken), owner: FutureSwapContracts.Farm, blacklistedTokens: [FutureSwapContracts.USDF], resolveLP: true, useDefaultCoreAssets: true, })
}

module.exports = {
  findora: {
    start: 1677029212, // 2023-02-22 01:26:52 UTC
    methodology: `Sum of liqudities backed USDF; and tokens values staked in the FutureSwap Farm.`,
    tvl: sumTokensExport({
      owner: FutureSwapContracts.USDF,
      tokens: Object.values(FindoraStableCoins),
    }),
    staking: farmStakings,
  },
};

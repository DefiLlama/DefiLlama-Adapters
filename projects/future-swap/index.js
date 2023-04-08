const sdk = require("@defillama/sdk");
const { sumTokensAndLPs, sumTokensExport } = require("../helper/unwrapLPs");
const { utils } = require("ethers");

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

async function farmStakings(timestamp, block) {
  const pools = await sdk.api.abi.call({
    target: FutureSwapContracts.Farm,
    abi: abiPools,
    block,
    chain: "findora",
  });

  const balances = {};

  const stakingTokens = pools.output
    .map((pool) => utils.getAddress(pool.lpToken))
    .map((token) => [
      token,
      FutureSwapContracts.Farm,
      token !== FutureSwapContracts.USDF,
    ]);

  await sumTokensAndLPs(
    balances,
    stakingTokens,
    block,
    "findora",
    (id) => `findora:${id.toLowerCase()}`
  );

  return balances;
}

module.exports = {
  findora: {
    start: 1677029212, // 2023-02-22 01:26:52 UTC
    methodology: `Sum of liqudities backed USDF; and tokens values staked in the FutureSwap Farm.`,
    tvl: sumTokensExport({
      chain: "findora",
      owner: FutureSwapContracts.USDF,
      tokens: Object.values(FindoraStableCoins),
    }),
    staking: farmStakings,
  },
};

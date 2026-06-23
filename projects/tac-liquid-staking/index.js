const ADDRESSES = require('../helper/coreAssets.json');
const LIQUID_STAKING = "0x0000000000000000000000000000000000001600";

async function tvl(api) {
  const states = await api.call({
    target: LIQUID_STAKING,
    abi: "function states() view returns (tuple(int256 mintRate, int256 stkTACTotalSupply, int256 netAmount, int256 totalDelShares, int256 totalLiquidTokens, int256 totalRemainingRewards, int256 totalUnbondingBalance, int256 proxyAccBalance))",
  });
  // Use totalLiquidTokens + totalUnbondingBalance + proxyAccBalance for TVL
  const tvl = BigInt(states.totalLiquidTokens) + BigInt(states.totalUnbondingBalance) + BigInt(states.proxyAccBalance);
  api.add(ADDRESSES.tac.WTAC, tvl.toString());
}

module.exports = {
  tac: { tvl },
  methodology: "TVL is the total TAC staked in the gTAC liquid staking contract.",
};

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");
const { pool2 } = require("../helper/pool2");

const FACTORY_CONTRACT = "0x09cA2dF4956720aB75c55313a7c83A63286fDd42";
const WETH_ADDRESS = ADDRESSES.arbitrum.WETH;
const BERRY_ETH_LP_ADDRESS = "0x6eF6eCD8AC5626525383d72AfaA9a7e7e39C0959";
const BERRY_ETH_STAKING_POOL = "0xcA4319D51472D7111fa3A103b07fc08fC8b20655";

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY_CONTRACT,
    topics: ["0x489ab9065c597368f4a678fadcb323bf4c848713ea7d5a296d16ec97203eae83",],
    eventAbi: "event StakingPoolDeployed(address indexed poolAddress,address indexed stakingToken,uint256 startTime,uint256 roundDurationInDays)",
    onlyArgs: true,
    fromBlock: 93557929,
  });

  const lsdAddresses = logs.map((i) => i.stakingToken === nullAddress ? WETH_ADDRESS : i.stakingToken);
  const poolAddresses = logs.map((i) => i.poolAddress);

  return sumTokens2({ api, tokensAndOwners2: [lsdAddresses, poolAddresses], blacklistedTokens: [BERRY_ETH_LP_ADDRESS], });
}

module.exports = {
  arbitrum: {
    methodology:
      "TVL of Staked ETH & LSD tokens, with pool2 including value of staked BERRY/ETH Uniswap-V2 LP tokens",
    tvl,
    pool2: pool2([BERRY_ETH_STAKING_POOL], [BERRY_ETH_LP_ADDRESS]),
  },
};

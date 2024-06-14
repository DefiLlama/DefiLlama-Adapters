const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");
const { staking } = require("../helper/staking");

const FACTORY_CONTRACT = "0xe4a51ec59233ba1f62b71f84554622a532b584ed";
const WETH_ADDRESS = ADDRESSES.ethereum.WETH;
const AGI_ETH_LP_ADDRESS = "0x498c00E1ccC2AFFf80F6Cc6144EAEB95c46cc3B5";
const AGI_ETH_STAKING_POOL = "0xC8187048f7Ab0db0774b674fEf3f4F4285A01bF4";

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY_CONTRACT,
    topics: ["0x489ab9065c597368f4a678fadcb323bf4c848713ea7d5a296d16ec97203eae83",],
    eventAbi: "event StakingPoolDeployed(address indexed poolAddress,address indexed stakingToken,uint256 startTime,uint256 roundDurationInDays)",
    onlyArgs: true,
    fromBlock: 17015686,
  });

  const lsdAddresses = logs.map((i) => i.stakingToken === nullAddress ? WETH_ADDRESS : i.stakingToken);
  const poolAddresses = logs.map((i) => i.poolAddress);

  return sumTokens2({ api, tokensAndOwners2: [lsdAddresses, poolAddresses], blacklistedTokens: [AGI_ETH_LP_ADDRESS], });
}

module.exports = {
  ethereum: {
    methodology:
      "TVL of Staked ETH & LSD tokens, with pool2 including value of staked AGI/ETH Uniswap-V2 LP tokens",
    tvl,
    pool2: staking([AGI_ETH_STAKING_POOL], [AGI_ETH_LP_ADDRESS]),
  },
};

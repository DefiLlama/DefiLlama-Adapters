const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");
const { staking } = require("../helper/staking");

const FACTORY_CONTRACT = "0x498B8f1E767E2A32ab68C1301F1e98b59a34dA94";
const WETH_ADDRESS = ADDRESSES.ethereum.WETH;

async function tvl(timestamp, block, chainBlocks, { api }) {
  const logs = await getLogs({
    api,
    target: FACTORY_CONTRACT,
    topics: ["0x489ab9065c597368f4a678fadcb323bf4c848713ea7d5a296d16ec97203eae83",],
    eventAbi: "event StakingPoolDeployed(address indexed poolAddress,address indexed stakingToken,uint256 startTime,uint256 roundDurationInDays)",
    onlyArgs: true,
    fromBlock: 17102070,
  });

  const lsdAddresses = logs.map((i) => i.stakingToken === nullAddress ? WETH_ADDRESS : i.stakingToken);
  const poolAddresses = logs.map((i) => i.poolAddress);

  return sumTokens2({ api, tokensAndOwners2: [lsdAddresses, poolAddresses] });
}

module.exports = {
  hallmarks: [
    [1682726400, "Rug Pull"]
  ],
  ethereum: {
    tvl,
  },
};

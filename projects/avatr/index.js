const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");
const { staking } = require("../helper/staking");

const FACTORY_CONTRACT = "0x9CAc6c4fDb0fCbbB1cA3064f7f6C3FAD22B0B92D";
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

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
  ethereum: {
    tvl,
  },
};

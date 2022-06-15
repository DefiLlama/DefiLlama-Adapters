const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const abi = require("./abi.json");

const seniorPoolAddress = "0x8481a6EbAf5c7DABc3F7e09e44A89531fd31F822";
const gfFactoryAddress = "0xd20508E1E971b80EE172c73517905bfFfcBD87f9";
const V2_START = 13097274
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  const logs = await sdk.api.util.getLogs({
    target: gfFactoryAddress,
    keys: [],
    fromBlock: V2_START,
    toBlock: ethBlock,
    topic: "PoolCreated(address,address)"
  })
  const tranchedPools = logs.output.map(l=>"0x"+l.topics[1].substr(26))

  await sumTokens(balances, [seniorPoolAddress, ...tranchedPools].map(pool=>[USDC, pool]), ethBlock)

  return balances;
};

const borrowed = async (_, block) => {
  const { output } = await sdk.api.abi.call({
    target: seniorPoolAddress,
    block,
    abi: abi.totalLoansOutstanding,
  })
  return {
    [USDC]: output
  };
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    borrowed,
  },
  methodology:
    "We count liquidity that is in both the Senior Pool as well as that from Backers in all the TranchedPools",
};

const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const seniorPoolAddress = "0x8481a6EbAf5c7DABc3F7e09e44A89531fd31F822";
const gfFactoryAddress = "0xd20508E1E971b80EE172c73517905bfFfcBD87f9";
const poolTokensAddress = "0x57686612C601Cb5213b01AA8e80AfEb24BBd01df";
const V2_START = 13097274
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const getTranchedPoolAddresses = async (ethBlock) => {
  const logs = await sdk.api.util.getLogs({
    target: gfFactoryAddress,
    keys: [],
    fromBlock: V2_START,
    toBlock: ethBlock,
    topic: "PoolCreated(address,address)"
  })
  return logs.output.map(l=>"0x"+l.topics[1].substr(26))
}

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  const tranchedPoolAddresses = await getTranchedPoolAddresses(ethBlock)

  await sumTokens(balances, [seniorPoolAddress, ...tranchedPoolAddresses].map(pool=>[USDC, pool]), ethBlock)

  return balances;
};

const borrowed = async (_, ethBlock) => {
  const balances = {};

  const tranchedPoolAddresses = await getTranchedPoolAddresses(ethBlock)

  const poolStats = (await sdk.api.abi.multiCall({
    calls: tranchedPoolAddresses.map((tranchedPoolAddress) => ({
      target: poolTokensAddress,
      params: tranchedPoolAddress,
    })),
    abi: abi.pools,
    ethBlock
  })).output

  const totalInvested = await poolStats.reduce((sum, thisPoolStats) => {
    return sum
      .plus(new BigNumber(thisPoolStats.output.totalMinted))
      .minus(new BigNumber(thisPoolStats.output.totalPrincipalRedeemed))
  }, new BigNumber(0))

  const seniorAssets = new BigNumber((
    await sdk.api.abi.call({
      abi: abi.assets,
      target: seniorPoolAddress,
      ethBlock,
    })
  ).output);

  const seniorLoansOutstanding = new BigNumber((
    await sdk.api.abi.call({
      abi: abi.totalLoansOutstanding,
      target: seniorPoolAddress,
      ethBlock,
    })
  ).output);

  // the totalInvested includes senior investments, so we subtract out seniorLoansOutstanding
  // to avoid double counting. Thus we arrive at the net invested + additional assets,
  // giving us total TVL
  const totalTvl = totalInvested.plus(seniorAssets).minus(seniorLoansOutstanding)

  sdk.util.sumSingleBalance(balances, USDC, String(totalTvl));

  return balances;
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    borrowed,
  },
  methodology:
    "We count liquidity that is in both the Senior Pool as well as that from Backers in all the Borrower Pools.",
};

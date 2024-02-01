const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { getLogs } = require('../helper/cache/getLogs')

const seniorPoolAddress = "0x8481a6EbAf5c7DABc3F7e09e44A89531fd31F822";
const gfFactoryAddress = "0xd20508E1E971b80EE172c73517905bfFfcBD87f9";
const poolTokensAddress = "0x57686612C601Cb5213b01AA8e80AfEb24BBd01df";
const V2_START = 13097274;
const USDC = ADDRESSES.ethereum.USDC;
let _trancheAddresses

const getTranchedPoolAddresses = async (api) => {
  if (!_trancheAddresses) _trancheAddresses = _get()
  return _trancheAddresses

  async function _get() {
    const logs = await getLogs({
      target: gfFactoryAddress,
      api,
      fromBlock: V2_START,
      topic: "PoolCreated(address,address)",
    });
    return logs.map((l) => "0x" + l.topics[1].substr(26));
  }
};

/**
 * This metric represents DeFiLlama's "base" definition of Total Value Locked. It includes
 * only USDC balances in the protocol (that is, in the `SeniorPool` and in all `TranchedPool`s).
 */
const tvl = async (timestamp, ethBlock, _, { api, }) => {
  const balances = {};

  const tranchedPoolAddresses = await getTranchedPoolAddresses(api);

  await sumTokens(
    balances,
    [seniorPoolAddress, ...tranchedPoolAddresses].map((pool) => [USDC, pool]),
    ethBlock
  );

  return balances;
};

/**
 * This metric supplements the "base" `tvl()` metric, by additionally counting value that has
 * been borrowed through the protocol.
 *
 * Goldfinch considers the protocol's Total Value Locked to be the sum of `tvl()` and `borrowed()`.
 *
 * This metric does not include the interest gains of Backers of `TranchedPool`s (though those
 * interest gains are reflected in the USDC balance of `TranchedPool`s in `tvl()`, before
 * that balance is withdrawn). This metric also does not reflect "writedowns" in the value of 
 * the principal of Backers of `TranchedPool`s, as there is no such writedown mechanic for Backers. 
 * Only the `SeniorPool` has a writedown mechanic -- which is reflected in this metric (via 
 * `SeniorPool.assets()`).
 */
const borrowed = async (_, ethBlock, _1, { api }) => {
  const _seniorPoolUsdcBalances = {};
  await sumTokens(
    _seniorPoolUsdcBalances,
    [seniorPoolAddress].map((pool) => [USDC, pool]),
    ethBlock
  );
  const seniorPoolUsdcBalance = new BigNumber(_seniorPoolUsdcBalances[USDC] || 0);

  const balances = {};

  const tranchedPoolAddresses = await getTranchedPoolAddresses(api);

  const poolStats = (
    await sdk.api.abi.multiCall({
      calls: tranchedPoolAddresses.map((tranchedPoolAddress) => ({
        target: poolTokensAddress,
        params: tranchedPoolAddress,
      })),
      abi: abi.pools,
      ethBlock,
    })
  ).output;

  const totalInvested = await poolStats.reduce((sum, thisPoolStats) => {
    return sum
      .plus(new BigNumber(thisPoolStats.output.totalMinted))
      .minus(new BigNumber(thisPoolStats.output.totalPrincipalRedeemed));
  }, new BigNumber(0));

  const seniorAssets = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: abi.assets,
        target: seniorPoolAddress,
        ethBlock,
      })
    ).output
  );

  const seniorLoansOutstanding = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: abi.totalLoansOutstanding,
        target: seniorPoolAddress,
        ethBlock,
      })
    ).output
  );

  // `totalInvested` reflects the senior pool's investments. So we subtract out
  // `seniorLoansOutstanding`, to avoid double-counting given the inclusion of
  // `SeniorPool.totalLoansOutstanding()` in the definition of `SeniorPool.assets()`.
  //
  // We also subtract out `seniorPoolUsdcBalance`, which is included in `SeniorPool.assets()`,
  // and which we do not want to count in this metric so that this metric is properly
  // supplementary to, and not double-counting vis-a-vis, `tvl()`.
  //
  // Note that for (a) a tranched pool that is open and whose principal hasn't been drawndown
  // yet, and for (b) a tranched pool that has had principal repaid but not yet withdrawn, there 
  // is a double-counting phenomenon for such a pool: the pool's USDC balance counted by 
  // `tvl()`, and its principal counted by `totalInvested`. We do not worry about preventing 
  // that double-counting, because it is transient; it disappears once the pool is drawndown 
  // (in the case of (a)) or withdrawn from (in the case of (b)). 
  const borrowed = totalInvested
    .plus(seniorAssets)
    .minus(seniorLoansOutstanding)
    .minus(seniorPoolUsdcBalance);

  sdk.util.sumSingleBalance(balances, USDC, String(borrowed));

  return balances;
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    borrowed,
  },
  methodology:
    "The base TVL metric counts only excess USDC liquidity in the Senior Pool, and USDC in all the Borrower Pools. " +
    "The Borrowed TVL component additionally counts loans made by the Senior Pool and the Backers of all Borrower Pools.",
};

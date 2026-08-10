const { unwrapUniswapV3NFT } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

/**
 * Waddle Club Staking - liquidity mining for Uniswap V3 style positions.
 *
 * TVL is what the staker contracts custody, which is two things:
 *
 *   1. LP NFTs. Staking transfers the position NFT to the staker, so the
 *      protocol holds it. The underlying pair sits in the pool contract, not
 *      the staker, so a token balance read returns zero: the positions have to
 *      be unwrapped from liquidity and tick bounds against the pool's current
 *      tick. Positions parked outside the live range are single sided and a
 *      50/50 assumption would misprice them.
 *   2. Reward tokens. Incentives are funded up front and the unclaimed balance
 *      sits in the staker until stakers claim or the refundee pulls it back.
 *
 * Reward tokens are discovered from IncentiveCreated rather than hardcoded, so
 * a new program with a new reward token needs no adapter change. Note refundee
 * is NOT indexed on this event, verified against the deployed logs.
 *
 * Expect this to be flagged doublecounted, as Convex and Aura are: the same LP
 * value is already counted under the DEX.
 */

const INCENTIVE_CREATED =
  "event IncentiveCreated(address indexed rewardToken, address indexed pool, uint256 startTime, uint256 endTime, address refundee, uint256 reward)";

/**
 * One entry per venue, where a venue is one DEX deployment on one chain.
 * Every staker here was deployed by the Waddle Club team; the Kumbaya venue
 * uses a staker deployed for Waddle Club and is not counted in Kumbaya's TVL.
 * The testnet venue is deliberately absent.
 */
const config = {
  megaeth: [
    {
      // Kumbaya V3 on MegaETH
      staker: "0x9F393A399321110Fb7D85aCc812b8e48A7c569aC",
      nft: "0x2b781C57e6358f64864Ff8EC464a03Fdaf9974bA",
      fromBlock: 3520323,
    },
    {
      // Uniswap V3 on MegaETH
      staker: "0xc52bb87d29b539F7A2d249aBa117Afaa41515D77",
      nft: "0xCDc86e98184e96436F733a8Bf31BD4F0214E6D7d",
      fromBlock: 23391267,
    },
  ],
  robinhood: [
    {
      // Uniswap V3 on Robinhood Chain
      staker: "0x6729488a69c70Fb1fD91aF240960a71C1E21be43",
      nft: "0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3",
      fromBlock: 31259721,
    },
  ],
};

async function tvl(api) {
  for (const venue of config[api.chain]) {
    const logs = await getLogs2({
      api,
      target: venue.staker,
      eventAbi: INCENTIVE_CREATED,
      fromBlock: venue.fromBlock,
    });

    // Unclaimed reward tokens sitting in the staker.
    const rewardTokens = [...new Set(logs.map((log) => log.rewardToken))];
    if (rewardTokens.length) {
      await api.sumTokens({ owner: venue.staker, tokens: rewardTokens });
    }

    // Staked positions. Unwrapped, not balance-read - see the note above.
    await unwrapUniswapV3NFT({
      api,
      owner: venue.staker,
      nftAddress: venue.nft,
    });
  }
}

module.exports = {
  methodology:
    "Counts assets custodied by the Waddle Club staker contracts: the Uniswap V3 style LP NFTs staked into incentive programs, unwrapped to their underlying tokens at the pool's current tick, plus reward tokens funded into incentives and not yet claimed or refunded. Reward tokens are discovered from IncentiveCreated events. LP value is also counted by the underlying DEX, so this is double counted at the chain level.",
  doublecounted: true,
  // First staker deployment (Kumbaya on MegaETH, block 3520323).
  start: "2025-12-21",
  megaeth: { tvl },
  robinhood: { tvl },
};

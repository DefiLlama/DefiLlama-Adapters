const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

const INCENTIVE_CREATED = "event IncentiveCreated(address indexed rewardToken, address indexed pool, uint256 startTime, uint256 endTime, address refundee, uint256 reward)";

const OWN_TOKENS = {
  robinhood: ['0xd3af6612119362d31d7a6c93ad5e6d01443c855d'], // HONK
};

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
  const venues = config[api.chain];

  // reward tokens in each staker
  const ownerTokens = [];
  for (const venue of venues) {
    const logs = await getLogs2({
      api,
      target: venue.staker,
      eventAbi: INCENTIVE_CREATED,
      fromBlock: venue.fromBlock,
    });
    const rewardTokens = [...new Set(logs.map((log) => log.rewardToken))];
    if (rewardTokens.length) ownerTokens.push([rewardTokens, venue.staker]);
  }

  return sumTokens2({
    api,
    ownerTokens,
    uniV3nftsAndOwners: venues.map((venue) => [venue.nft, venue.staker]),
    blacklistedTokens: OWN_TOKENS[api.chain] ?? [],
  });
}

async function staking(api) {
  const ownTokens = OWN_TOKENS[api.chain];
  if (!ownTokens?.length) return;
  for (const venue of config[api.chain]) {
    await api.sumTokens({ owner: venue.staker, tokens: ownTokens });
  }
}

module.exports = {
  methodology:
    "tvl is the assets the Waddle Club stakers custody: the staked Uniswap V3 style LP NFTs unwrapped to their underlying tokens at the pool's current tick, plus reward tokens funded into incentives and not yet claimed or refunded (discovered from IncentiveCreated events). LP value is also counted by the underlying DEX, so tvl is double counted at the chain level.",
  doublecounted: true,
  // First staker deployment (Kumbaya on MegaETH, block 3520323).
  start: "2025-12-21",
  megaeth: { tvl },
  robinhood: { tvl, staking },
};

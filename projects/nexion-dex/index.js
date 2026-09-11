const { sumTokens2 } = require("../helper/unwrapLPs");

// veNEON Voting Escrow - users lock NEON for veNEON NFTs
const VE_NEON = "0x15Fc4C8df3ED16049E11134054C40c1E6D9107e3";
const NEON = "0xF2Da3942616880E52e841E5C504B5A9Fba23FFF0";

// Voter V3 contract exposes poolFactory() to discover all AURA DEX pools
const VOTER = "0x0888103450FFF33f46b8B4B1a4a65D7A88492D94";

/**
 * Calculates DEX TVL by dynamically fetching all pools from the
 * on-chain PoolFactory (discovered via the Voter contract).
 */
async function tvl(api) {
  // Get the PoolFactory address from the Voter contract
  const factory = await api.call({ abi: 'address:poolFactory', target: VOTER });

  // Enumerate all pools from factory
  const pools = await api.fetchList({
    target: factory,
    lengthAbi: 'uint256:allPoolsLength',
    itemAbi: 'function allPools(uint256) view returns (address)',
  });

  // Get token0 and token1 for each pool
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: "address:token0", calls: pools }),
    api.multiCall({ abi: "address:token1", calls: pools }),
  ]);

  // Sum token balances held by each pool contract (total DEX liquidity)
  const tokensAndOwners = [];
  pools.forEach((pool, i) => {
    tokensAndOwners.push([token0s[i], pool]);
    tokensAndOwners.push([token1s[i], pool]);
  });

  return sumTokens2({ api, tokensAndOwners });
}

/**
 * Calculates staking TVL: NEON locked in the VotingEscrow (veNEON).
 */
async function staking(api) {
  return sumTokens2({ api, tokensAndOwners: [[NEON, VE_NEON]] });
}

module.exports = {
  methodology:
    "TVL is the total liquidity across all AURA DEX pools discovered dynamically from the on-chain PoolFactory. Staking is the total NEON locked in the VotingEscrow (veNEON).",
  pulse: {
    tvl,
    staking,
  },
};

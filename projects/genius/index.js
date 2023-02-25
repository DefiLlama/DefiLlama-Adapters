/* Genius staking operates on two models:
*  - Direct staking with GENI token.
*    - Policy: Basic (basicLockedMinersSupply())
*      Lower APR, no penalties for early or late end staking.
*    - Policy: Advanced (advLockedMinersSupply())
*      Higher APR, penalties for early or late end staking.
*  - Debt based staking with deposited collateral
*     Collateral deposits enables GENI borrow.
*     GENI is locked back in the pool when the collateral debt is settled
*     Locked GENI are waiting for collateral to be settled for it.
*     While it's waiting it is generating yield.
*
*  Staking and `mining` are used interchangeably in Genius
* */
const sdk = require("@defillama/sdk");
const geniusAbi = require("./genius-abi.json");
const stabilityAbi = require("./genius-stability-abi.json");

/* Genius staking contract*/
const GENIUS_CONTRACT = "0x444444444444C1a66F394025Ac839A535246FCc8";
/* Genius stability pool / debt contract*/
const STABILITY_POOL = "0xDCA692d433Fe291ef72c84652Af2fe04DA4B4444";

/* Staking: Advanced and Basic mining */
const miningBalances = {
  "ethereum": {},
  "bsc": {},
  "polygon": {},
  "avax": {}
};
/* TVL: Staking plus Stability pool */
const tvlBalances = {
  "ethereum": {},
  "bsc": {},
  "polygon": {},
  "avax": {}
};

async function tvl(_, _1, _2, { api }) {
  /* Collect Basic miner locked */
  const basicLockedMinersSupply = await api.call({
    target: GENIUS_CONTRACT,
    abi: geniusAbi.basicLockedSupply
  });
  /* Collect Advanced miner locked */
  const advLockedMinersSupply = await api.call({
    target: GENIUS_CONTRACT,
    abi: geniusAbi.advLockedSupply
  });
  /* Collect settled GENI in stability pool (locked waiting for collateral return) */
  const totalSettledGenitos = await api.call({
    target: STABILITY_POOL,
    abi: stabilityAbi.totalSettledGenitos
  });
  /* TVL is all miners + GENI locked in the stability pool */
  const totalLockedMinersSupply = (basicLockedMinersSupply + advLockedMinersSupply);
  const totalLockedSupply = (totalLockedMinersSupply + totalSettledGenitos);
  await sdk.util.sumSingleBalance(tvlBalances[api.chain], GENIUS_CONTRACT, totalLockedSupply, api.chain);
  return tvlBalances[api.chain];
}

async function staking(_, _1, _2, { api }) {
  /* Collect Basic miner locked */
  const basicLockedMinersSupply = await api.call({
    target: GENIUS_CONTRACT,
    abi: geniusAbi.basicLockedSupply
  });
  /* Collect Advanced miner locked */
  const advLockedMinersSupply = await api.call({
    target: GENIUS_CONTRACT,
    abi: geniusAbi.advLockedSupply
  });
  /* Total Staked across both Basic and Advanced mining */
  const totalLockedMinersSupply = (basicLockedMinersSupply + advLockedMinersSupply);
  await sdk.util.sumSingleBalance(miningBalances[api.chain], GENIUS_CONTRACT, totalLockedMinersSupply, api.chain);
  return miningBalances[api.chain];
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    `Staking: counts the number of GENI tokens locked in Basic and Advanced miners per chain.
   TVL: counts the number of staked plus locked in the stability pool as settled.
  `,
  ethereum: {
    staking,
    tvl
  },
  bsc: {
    staking,
    tvl
  },
  polygon: {
    staking,
    tvl
  },
  avax: {
    staking,
    tvl
  }
};

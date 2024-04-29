const ADDRESSES = require('../helper/coreAssets.json')
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
*  `Staking` and `mining` are used interchangeably in Genius
*
* Genius TVL is the sum of all locked supported collateral in the debt pool
* The list of supported collateral is provided.
*
* */
const sdk = require("@defillama/sdk");
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')

const geniusAbi = require("./genius-abi.json");
const stabilityAbi = require("./genius-stability-abi.json");

/* Genius staking contract*/
const GENIUS_CONTRACT = "0x444444444444C1a66F394025Ac839A535246FCc8";
/* Genius stability pool / debt contract*/
const STABILITY_POOL = "0xDCA692d433Fe291ef72c84652Af2fe04DA4B4444";

/* Native currencies and ERC-20 tokens approved for collateral*/
const STABILITY_POOL_COLLATERAL_ADDRESSES = {
  "bsc": {
    "BUSD": ADDRESSES.bsc.BUSD,
    "BNB": nullAddress,
  },
  "ethereum": {
    "DAI": ADDRESSES.ethereum.DAI,
    "ETH": nullAddress,
  },
  "avax": {
    "USDC": ADDRESSES.avax.USDC,
    "AVAX": nullAddress,
  },
  "polygon": {
    "DAI": ADDRESSES.polygon.DAI,
    "MATIC": nullAddress,
  },
  "pulse": {
    "DAI": ADDRESSES.pulse.DAI,
    "PLS": nullAddress
  }
};

async function tvl(api) {
  return sumTokens2({ api, owner: STABILITY_POOL, tokens: Object.values(STABILITY_POOL_COLLATERAL_ADDRESSES[api.chain])})
}

async function staking(api) {
  // return sumTokens2({ api, owner: STABILITY_POOL, tokens: [GENIUS_CONTRACT]})
  const balances = {};
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
  sdk.util.sumSingleBalance(balances, GENIUS_CONTRACT, basicLockedMinersSupply);
  sdk.util.sumSingleBalance(balances, GENIUS_CONTRACT, advLockedMinersSupply);
  sdk.util.sumSingleBalance(balances, GENIUS_CONTRACT, totalSettledGenitos);
  return balances;
}

module.exports = {
  methodology:
`Staking: counts the number of GENI tokens locked in Basic and Advanced miners per chain.
TVL: counts total number of value locked of all collateral tokens and native in the debt pool per chain.
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
  },
  pulse: {
    staking,
    tvl
  },
};

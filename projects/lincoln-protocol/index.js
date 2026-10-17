// DefiLlama TVL adapter — Lincoln Protocol (Robinhood Chain, chain id 4663).
// Destination: DefiLlama/DefiLlama-Adapters  projects/lincoln-protocol/index.js
// STATUS: DRAFT. Pool addresses below are placeholders until the mainnet
// deployment manifest exists; do not open the PR before TVL is non-zero.
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Each privacy pool holds exactly one asset. TVL = asset balance of each pool.
// Fill from config/phase2-mainnet-deployed.json after deployment.
const POOLS = {
  // pool address            : asset (ADDRESSES.null = native ETH)
  // '0x...eth-pool':          ADDRESSES.null,
  // '0x...usdg-pool':         '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  // '0x...nvda-pool':         '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  // '0x...spy-pool':          '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  // '0x...meta-pool':         '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35', // META
  // '0x...tsla-pool':         '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  // '0x...googl-pool':        '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3', // GOOGL
  // '0x...qqq-pool':          '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68', // QQQ
  // '0x...mstr-pool':         '0xec262a75e413fAfD0dF80480274532C79D42da09', // MSTR
};

async function tvl(api) {
  const ownerTokens = Object.entries(POOLS).map(([pool, token]) => [[token], pool]);
  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  methodology:
    'Each Lincoln privacy pool is an immutable contract holding a single asset (ETH, USDG or a ' +
    'Robinhood tokenized stock). TVL is the on-chain balance of every pool. Route adapters and ' +
    'relays hold no user funds between transactions, so they are not counted.',
  // start: <deployment block>,
  robinhood: { tvl },
};

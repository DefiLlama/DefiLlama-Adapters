// Lincoln Protocol — private balances on Robinhood Chain (chain id 4663).
// Nine immutable single-asset privacy pools (contract release v0.1.0-rc.3).
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// pool -> asset it custodies (ADDRESSES.null = native ETH)
const POOLS = {
  '0xF9c767CAb9B9A7dE8Dd959967269787880267ab2': ADDRESSES.null, // ETH
  '0x5Cd4c081eb747406DAb66e22004324600f1928C9': '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  '0x4C8BAEb78b032EA3610E0F5D4C8B5Bb4fF5995f7': '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x8a29Db84A20B0A3CA528FAE0F69F50FfD39c6C39': '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0xA2078e02A631ae9218DBAa84987a24741bD24d10': '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35', // META
  '0xE8c619705B7452c2281cA8fA675a355846D34BFE': '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0x31Bd720527D9875b444c0946c5795351a56d9d8B': '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3', // GOOGL
  '0xd4375275F5FA231e238c9FF1237A8e8666Be6B62': '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68', // QQQ
  '0x207Dc4DD4E40Ab280dF9eC10CD5Edf04685e9d88': '0xec262a75e413fAfD0dF80480274532C79D42da09', // MSTR
};

async function tvl(api) {
  const ownerTokens = Object.entries(POOLS).map(([pool, token]) => [[token], pool]);
  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  methodology:
    'Each Lincoln privacy pool is an immutable contract holding a single asset (ETH, USDG or a Robinhood ' +
    'tokenized stock). TVL is the on-chain balance of every pool. Route adapters and relays hold no user ' +
    'funds between transactions, so they are not counted.',
  start: 1792216447,
  robinhood: { tvl },
};

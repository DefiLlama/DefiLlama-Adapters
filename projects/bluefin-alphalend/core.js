const { getDynamicFieldObjects } = require('../helper/chain/sui');

const MARKETS_CONTAINER = '0x2326d387ba8bb7d24aa4cfa31f9a1e58bf9234b097574afb06c5dfb267df4c2e';
const SWITCH_TS = 1778976000;

// Ember Protocol vault-share tokens that DefiLlama can't price yet.
// Map them to their underlying priced asset. The share trades ~1:1 with the
// underlying plus a small accrued-yield premium (~3%), so this slightly
// under-counts (conservative). Decimals match the base in every case, so the
// raw balance can be moved to the base coin type as-is.
const PRICE_REMAP = {
  // eWAL (Ember WAL, 9dp) -> WAL (9dp)
  '0x8a398f65f8635be31c181632bf730aea25074505d70c77d9b287e7d4f063ef70::ewal::EWAL':
    '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
  // exBTC (Ember xBTC, 8dp) -> xBTC (8dp)
  '0x56589f5381303a763a62e79ac118e5242f83652f4c5a9448af75162d8cb7140c::exbtc::EXBTC':
    '0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC',
  // eThird (Ember Third Eye, 6dp, ~$1.03 USD-denominated) -> USDC (6dp)
  '0x89b0d4407f17cc1b1294464f28e176e29816a40612f7a553313ea0a797a5f803::ethird::ETHIRD':
    '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
};

async function fetchMarkets() {
  return getDynamicFieldObjects({
    parent: MARKETS_CONTAINER,
    idFilter: (i) => i.objectType.includes('::market::Market'),
  });
}

async function tvl(api) {
  const marketData = await fetchMarkets();
  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;
    const rawCoinType = "0x" + fields.value.fields.coin_type.fields.name;
    const coinType = PRICE_REMAP[rawCoinType] || rawCoinType;
    api.add(coinType, Number(fields.value.fields.balance_holding));
  }
}

async function borrowed(api) {
  const marketData = await fetchMarkets();
  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;
    const rawCoinType = "0x" + fields.value.fields.coin_type.fields.name;
    const coinType = PRICE_REMAP[rawCoinType] || rawCoinType;
    api.add(coinType, Number(fields.value.fields.borrowed_amount));
  }
}

module.exports = { tvl, borrowed, SWITCH_TS};
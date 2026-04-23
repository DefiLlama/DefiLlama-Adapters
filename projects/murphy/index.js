const { getTokenBalances } = require('../helper/chain/keeta');
const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk')

const SUPPORTED_TOKENS = [
  ADDRESSES.keeta.KTA,
  ADDRESSES.keeta.USDC,
  ADDRESSES.keeta.EURC,
]

const POOLS = [
  // MURF liquidity pool
  'keeta_aqg2mcrdbifrpfw57ufyarexbesztnbqbey446mpykhmacjpskod6x44tvwkg',
  // Proxy Anchor liquidity pool
  'keeta_aabw6ptynqvk6vc76fdgzdozi72ytey2jnbrdvzdavl6643e5zydwams3visioy',
]

async function tvl(api) {
  await sdk.util.runInPromisePool({
    concurrency: 10,
    items: POOLS,
    processor: async (pool) => {
      const balances = await getTokenBalances(pool, api.timestamp, SUPPORTED_TOKENS);
      for (const [token, balance] of balances) {
        api.add(token, balance);
      }
    }
  })
}

module.exports = {
  methodology: 'TVL is calculated as the sum of all KTA, USDC, EURC tokens held in liquidity pool accounts.',
  // Date of Murphy FX anchor release
  start: '2025-11-21',
  keeta: {
    tvl,
  }
}

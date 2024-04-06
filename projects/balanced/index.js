const { sumTokens } = require('../helper/chain/icx');
const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json');

const balancedDexContract = 'cxa0af3165c08318e988cb30993b3048335b94af6c';

async function tvl(api) {
  const pools = await getConfig('balancedDex', 'https://balanced.icon.community/api/v1/pools')
  const tokens = pools.map(pool => [pool.base_address, pool.quote_address]).flat().filter(i => i).map(i => i === 'ICX' ? ADDRESSES.null : i)
  return sumTokens({ api, tokens, owner: balancedDexContract })
}

module.exports = {
  methodology: 'TVL consists of liquidity on the DEX, deposits made to the lending program and the stability fund. Data is pulled from the ICX API "https://ctz.solidwallet.io/api/v3" and Balanced stats API "https://balanced.sudoblock.io/api/v1/docs',
  icon: {
    tvl
  },
  archway: {
    tvl: () => ({})
  },
};

const { sumTokens } = require('../helper/chain/icx');
const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json');
const { computeTVL, getExternalChainDeposits } = require('./helper')

const balancedDexContract = 'cxa0af3165c08318e988cb30993b3048335b94af6c';

async function tvl(api) {
  const pools = await getConfig('balancedDex', 'https://balanced.icon.community/api/v1/pools')
  const tokens = pools.map(pool => [pool.base_address, pool.quote_address]).flat().filter(i => i).map(i => i === 'ICX' ? ADDRESSES.null : i)
  const deposits = await getExternalChainDeposits();
  const bridgedTokenSet = new Set(deposits.map(deposit => deposit.iconchaincontract));
  const filteredTokens = tokens.filter(token => !bridgedTokenSet.has(token));
  return sumTokens({ api, tokens: filteredTokens, owner: balancedDexContract })
}



// https://github.com/balancednetwork/balanced-java-contracts/wiki/Contract-Addresses
// https://github.com/DefiLlama/DefiLlama-Adapters/pull/9857#issuecomment-2060842344
module.exports = {
  methodology: "TVL: The total liquidity held on the Balanced exchange and in the Stability Fund. Fees: Collected from traders",
  icon: {
    tvl
  },
  archway: {
    tvl: async () => await computeTVL("archway"),
  },
  bsc: {
    tvl: async () => await computeTVL("bnbchain"),
  },
  avax: {
    tvl: async () => await computeTVL("avalanche"),
  },
  injective: {
    tvl: async () => await computeTVL("injective"),
  },
  base: {
    tvl: async () => await computeTVL("base"),
  },
  arbitrum: {
    tvl: async () => await computeTVL("arbitrum"),
  },
  sui: {
    tvl: async () => await computeTVL("sui"),
  },
  solana: {
    tvl: async () => await computeTVL("solana"),
  },
  stellar: {
    tvl: async () => await computeTVL("stellar"),
  },
  optimism: {
    tvl: async () => await computeTVL("optimism"),
  }
};

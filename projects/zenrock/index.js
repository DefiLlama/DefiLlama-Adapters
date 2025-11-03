const { sumTokens: sumBitcoinTokens } = require('../helper/chain/bitcoin');
const { zenrock } = require('../helper/bitcoin-book/fetchers');

/**
 * Queries Bitcoin balances for all zrchain treasury and change addresses
 * Returns balances object with Bitcoin TVL
 */
async function tvl() {
  // Fetch all protocol addresses (treasury + change) from the bitcoin-book fetcher
  const allAddresses = await zenrock();

  if (allAddresses.length === 0) {
    return { bitcoin: '0' };
  }

  // Use Bitcoin helper to sum balances for all addresses
  const balances = {};
  await sumBitcoinTokens({ balances, owners: allAddresses });

  return balances;
}

/**
 * Queries Zcash balances for all zrchain treasury and change addresses
 * Returns balances object with Zcash TVL
 *
 * NOTE: Currently using supply-based approach as a test implementation.
 * The address-based approach is commented out below for future use.
 */
async function zcashTvl() {
  // Fetch custodied amount from DCT supply endpoint
  const { get } = require('../helper/http');
  const { getConfig } = require('../helper/cache');
  const sdk = require('@defillama/sdk');

  const DCT_SUPPLY_API = 'https://api.diamond.zenrocklabs.io/dct/supply';

  const supplyData = await getConfig('zenrock/dct_supply', DCT_SUPPLY_API, {
    fetcher: async () => {
      const response = await get(DCT_SUPPLY_API);
      return response;
    }
  });

  const balances = {};

  // Find ASSET_ZENZEC in supplies array
  const zenZecSupply = supplyData.supplies?.find(
    item => item.supply?.asset === 'ASSET_ZENZEC'
  );

  if (zenZecSupply && zenZecSupply.supply?.custodied_amount) {
    // custodied_amount is in Zatoshi (smallest unit, like satoshis for BTC)
    // Convert to ZEC by dividing by 1e8
    const custodiedAmount = Number(zenZecSupply.supply.custodied_amount);
    const custodiedZEC = custodiedAmount / 1e8;

    sdk.util.sumSingleBalance(balances, 'zcash', custodiedZEC);
  }

  return balances;
}

module.exports = {
  methodology: 'zrchain locks native assets through its decentralized MPC network. zenBTC, Zenrock\'s flagship product, is a yield-bearing wrapped Bitcoin issued on Solana and EVM chains. TVL represents the total Bitcoin locked in zrchain treasury addresses. All zenBTC is fully backed by native Bitcoin, with the price of zenBTC anticipated to increase as yield payments are made continuously.',
  bitcoin: {
    tvl,
  },
  zcash: {
    tvl: zcashTvl,
  },
};

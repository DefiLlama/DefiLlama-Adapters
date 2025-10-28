const { sumTokens: sumBitcoinTokens } = require('../helper/chain/bitcoin');

// zrchain API endpoints
const ZRCHAIN_WALLETS_API = 'https://api.diamond.zenrocklabs.io/zrchain/treasury/zenbtc_wallets';
const ZENBTC_PARAMS_API = 'https://api.diamond.zenrocklabs.io/zenbtc/params';
const ZRCHAIN_KEY_BY_ID_API = 'https://api.diamond.zenrocklabs.io/zrchain/treasury/key_by_id';

/**
 * Fetches all Bitcoin mainnet addresses from zrchain treasury with pagination
 * Filters for WALLET_TYPE_BTC_MAINNET type only
 */
async function getBitcoinAddresses() {
  const btcAddresses = [];
  let nextKey = null;

  try {
    while (true) {
      let url = ZRCHAIN_WALLETS_API;
      if (nextKey) {
        url += `?pagination.key=${encodeURIComponent(nextKey)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Extract Bitcoin mainnet addresses from zenbtc_wallets array
      if (data.zenbtc_wallets && Array.isArray(data.zenbtc_wallets)) {
        for (const walletGroup of data.zenbtc_wallets) {
          if (walletGroup.wallets && Array.isArray(walletGroup.wallets)) {
            for (const wallet of walletGroup.wallets) {
              // Filter for Bitcoin mainnet addresses only
              if (wallet.type === 'WALLET_TYPE_BTC_MAINNET' && wallet.address) {
                btcAddresses.push(wallet.address);
              }
            }
          }
        }
      }

      // Check for next page
      if (data.pagination && data.pagination.next_key) {
        nextKey = data.pagination.next_key;
      } else {
        // No more pages, exit loop
        break;
      }
    }

    console.log(`Fetched ${btcAddresses.length} Bitcoin mainnet addresses from zrchain treasury`);
    return btcAddresses;
  } catch (error) {
    console.error(`Error fetching Bitcoin addresses from zrchain API: ${error.message}`);
    return [];
  }
}

/**
 * Fetches change addresses from zenbtc params
 * Queries each change address key ID to get the actual Bitcoin mainnet addresses
 */
async function getChangeAddresses() {
  const changeAddresses = [];

  try {
    // Fetch zenbtc params to get change address key IDs
    const paramsResponse = await fetch(ZENBTC_PARAMS_API);
    const paramsData = await paramsResponse.json();

    const changeAddressKeyIDs = paramsData.params?.changeAddressKeyIDs || [];

    // Fetch each change address
    for (const keyID of changeAddressKeyIDs) {
      try {
        const keyResponse = await fetch(`${ZRCHAIN_KEY_BY_ID_API}/${keyID}/WALLET_TYPE_BTC_MAINNET/`);
        const keyData = await keyResponse.json();

        // Extract Bitcoin mainnet addresses from wallets array
        if (keyData.wallets && Array.isArray(keyData.wallets)) {
          for (const wallet of keyData.wallets) {
            if (wallet.type === 'WALLET_TYPE_BTC_MAINNET' && wallet.address) {
              changeAddresses.push(wallet.address);
            }
          }
        }
      } catch (error) {
        console.warn(`Error fetching change address for key ID ${keyID}: ${error.message}`);
      }
    }

    if (changeAddresses.length > 0) {
      console.log(`Fetched ${changeAddresses.length} Bitcoin change address(es)`);
    }

    return changeAddresses;
  } catch (error) {
    console.error(`Error fetching change addresses from zenbtc params: ${error.message}`);
    return [];
  }
}

/**
 * Queries Bitcoin balances for all treasury and change addresses
 * Returns balances object with Bitcoin TVL
 */
async function tvl() {
  try {
    const [btcAddresses, changeAddresses] = await Promise.all([
      getBitcoinAddresses(),
      getChangeAddresses(),
    ]);

    const allAddresses = [...btcAddresses, ...changeAddresses];

    if (allAddresses.length === 0) {
      console.warn('No Bitcoin addresses found in treasury or change addresses');
      return { bitcoin: '0' };
    }

    // Use Bitcoin helper to sum balances for all addresses
    const balances = {};
    await sumBitcoinTokens({ balances, owners: allAddresses });

    console.log(`Bitcoin TVL from ${allAddresses.length} addresses (${btcAddresses.length} treasury + ${changeAddresses.length} change): ${balances.bitcoin} BTC`);
    return balances;
  } catch (error) {
    console.error(`Error calculating Bitcoin TVL: ${error.message}`);
    return { bitcoin: '0' };
  }
}

module.exports = {
  methodology: 'zrchain locks native Bitcoin through its decentralized MPC network. zenBTC, Zenrock\'s flagship product, is a yield-bearing wrapped Bitcoin issued on Solana and EVM chains. TVL represents the total Bitcoin locked in zrchain treasury addresses. All zenBTC is fully backed by native Bitcoin, with the price of zenBTC anticipated to increase as yield payments are made continuously.',
  bitcoin: {
    tvl,
  },
};

// node test.js projects/zenrock/index.js

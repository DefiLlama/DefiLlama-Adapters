const { sumTokens: sumBitcoinTokens } = require('../helper/chain/bitcoin');
const { zenrock } = require('../helper/bitcoin-book/fetchers');

/**
 * Queries Bitcoin balances for all zrchain treasury and change addresses
 * Returns balances object with Bitcoin TVL
 */
async function tvl() {
  try {
    // Fetch all protocol addresses (treasury + change) from the bitcoin-book fetcher
    const allAddresses = await zenrock();

    if (allAddresses.length === 0) {
      console.warn('No Bitcoin addresses found for zrchain protocol');
      return { bitcoin: '0' };
    }

    // Use Bitcoin helper to sum balances for all addresses
    const balances = {};
    await sumBitcoinTokens({ balances, owners: allAddresses });

    console.log(`Bitcoin TVL from ${allAddresses.length} zrchain addresses: ${balances.bitcoin} BTC`);
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

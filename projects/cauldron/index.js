// This adaptor uses the Riftenlabs Indexer API to query for TVL.
//
// This indexer is open source (GPLv3) and available at:
// https://gitlab.com/riftenlabs/riftenlabs-indexer

const axios = require("axios");

async function tvl({ timestamp }) {
  const { data } = await axios.get(`https://indexer.riften.net/cauldron/tvl/${timestamp}`);

  // Every token pair is matched with BCH. We collect the BCH side and multiply by 2 to account for both sides of the pool.
  const total_sats = data.reduce((acc, token_pair) => {
    return acc + BigInt(token_pair.satoshis)
  }, BigInt(0));

  // TODO: Map tokens to CoinGecko identifiers.
  // Currently, no tokens on the Bitcoin Cash are on CoinGecko.

  return {
    'bitcoin-cash': Number(total_sats) * 2 / 1e8,
  }
}

module.exports = {
  methodology: "Query the Riftenlabs indexer for pool BCH balances across all active Cauldron pool UTXOs. Cauldron pools are AMMs paired with BCH; the BCH side is doubled to account for both sides of the pool.",
  start: '2023-07-01',
  misrepresentedTokens: true,
  bitcoincash: { tvl },
  hallmarks: [
    ['2023-07-01', "First cauldron contract deployed (SOCK)"],
    ['2023-08-28', "Cauldron opens trading for any token"],
  ]
};

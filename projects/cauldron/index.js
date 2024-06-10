// This adaptor uses the Riftenlabs Indexer API to query for TVL.
//
// This indexer is open source (GPLv3) and available at:
// https://gitlab.com/riftenlabs/riftenlabs-indexer

const axios = require("axios");

async function tvl({ timestamp }) {
  const { data } = await axios.get(`http://rostrum.cauldron.quest:8000/cauldron/tvl/${timestamp}`);

  // Every token pair is matched with BCH. We collect total value locked on the BCH side of the contract.
  const total_sats = data.reduce((acc, token_pair) => {
    return acc + BigInt(token_pair.satoshis)
  }, BigInt(0));

  // TODO: Map tokens to CoinGecko identifiers.
  // Currently, no tokens on the Bitcoin Cash are on CoinGecko.

  return {
    'bitcoin-cash': Number(total_sats / 100000000n),
  }
}

module.exports = {
  methodology: "Scrape the blockchain and filter for spent transaction outputs that match the cauldron contract's redeem script. Check if the transaction has an output with a locking script that matches the redeem script in the input. A match on locking script means the funds are still locked in the DEX contract. Aggregate the value of funds in contract utxos.",
  start: 1688198180,
  bitcoincash: { tvl },
  hallmarks: [
    [1688198180, "First cauldron contract deployed (SOCK)"],
    [1693230446, "Cauldron opens trading for any token"],
  ]
};

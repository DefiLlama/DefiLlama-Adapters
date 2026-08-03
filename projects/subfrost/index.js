const { sumTokens } = require("../helper/sumTokens");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

// SUBFROST is a decentralized signing network on Bitcoin L1. It issues frBTC, a
// synthetic bitcoin pegged 1:1 to BTC, against BTC held by a FROST signer set. frBTC
// is issued on two Bitcoin metaprotocols, Alkanes and BRC2.0, each with its own
// custody address.
const owners = bitcoinAddressBook.subfrost;

async function tvl(api) {
  return sumTokens({ owners, api });
}

module.exports = {
  bitcoin: { tvl },
  methodology: `Total value of all BTC and stablecoins held by the transparent and verifiable SUBFROST signing group. Covers both frBTC deployments: Alkanes and BRC2.0.`,
};

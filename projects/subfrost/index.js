const { sumTokens } = require("../helper/sumTokens");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

// SUBFROST is a decentralized custodian on Bitcoin L1. It issues frBTC, a synthetic
// bitcoin pegged 1:1 to BTC, against BTC held by a FROST signer set. frBTC is issued
// on two Bitcoin metaprotocols, Alkanes and BRC2.0, each with its own custody address.
const owners = bitcoinAddressBook.subfrost;

async function tvl(api) {
  return sumTokens({ owners, api });
}

module.exports = {
  bitcoin: { tvl },
  methodology: `TVL is the BTC held in the SUBFROST signer custody addresses that back frBTC, read directly from the Bitcoin chain. Covers both frBTC deployments: Alkanes and BRC2.0. frBTC minted against these deposits is not counted separately, so nothing is double counted.`,
};

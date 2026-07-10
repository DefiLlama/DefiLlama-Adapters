// Vishwa — BTCvc (zk light-client proof-of-asset BTC)
//
// BTCvc is Vishwa's verifiable-reserve BTC product: BTC held in custody is proven on-chain by
// Vishwa's zk light client, and BTCvc (the receipt on Sui) is a 1:1 claim on that reserve.
//
// METHODOLOGY (no double-count):
//   TVL = the BTC reserve backing BTCvc, counted on Bitcoin (its native chain). The BTCvc
//   receipt on Sui is a 1:1 claim on the same BTC and is deliberately NOT counted.
//   The custody set (bitcoinAddressBook.vishwa()) is the set the light client proves.
//
// This adapter was removed in an upstream clean-up after the previous version returned an
// empty address array (which reads as a false $0). This version throws when the address API
// returns empty, so a transient API outage keeps the last good value instead of zeroing TVL.
//
// Separate product from Naro / BTCvp (projects/naro): separate custody, no cross-count.

const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

module.exports = {
  methodology:
    "TVL is the BTC reserve backing BTCvc, counted on Bitcoin and verified on-chain by " +
    "Vishwa's zk light client. The BTCvc receipt token (Sui) is a 1:1 claim on this reserve " +
    "and is not counted separately, to avoid double-counting.",
  bitcoin: {
    tvl: async () => {
      const owners = await bitcoinAddressBook.vishwa();
      if (!owners || !owners.length)
        throw new Error("vishwa: BTC address API returned empty; skipping to avoid a false $0");
      return sumTokens({ owners });
    },
  },
};

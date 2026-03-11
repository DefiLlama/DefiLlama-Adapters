const { sumTokens } = require("../helper/sumTokens.js");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

async function tvl(api) {
  const owners = await bitcoinAddressBook.coffernetwork();
  return sumTokens({ owners, api })
}

module.exports = {
  methodology: "TVL is fetched from Coffer Network Bitcoin Staking Protocol from native Bitcoin",
  start: "2025-01-20",
  isHeavyProtocol: true,
  doublecounted: true,
  bitcoin: {
    tvl,
  },
}
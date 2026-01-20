const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinBook = require('../helper/bitcoin-book');

async function tvl() {
  return sumTokens({ owners: await bitcoinBook.dlcLink() });
}

module.exports = {
  bitcoin: { tvl },
};

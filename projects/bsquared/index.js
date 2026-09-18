const sdk = require('@defillama/sdk');
const { sumTokensExport: sumBRC20TokensExport } = require("../helper/chain/brc20");
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  hallmarks: [
    ['2024-03-12', "Cease pre-deposit"],
  ],
  methodology: "Staking tokens via BSquared Network Buzz counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.bsquaredBTC }),
      // sumBRC20TokensExport({ owners: bitcoinAddressBook.bsquaredBRC20 }),  // disable brc20
    ]),
  },
};

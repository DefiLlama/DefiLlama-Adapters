const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


module.exports = {
  methodology: "Staking tokens via AINN Layer2 Dataset counts as TVL.",
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.ainn }),
  },
  zklink: {
    tvl: sumTokensExport({
      owners: ["0xc698c23d7cDE4203EafD8F45d8bab8fA86D413d1"],
      tokens: ["0xEbc45Ef3B6D7E31573DAa9BE81825624725939f9"] //wbtc
    }),
  },
};

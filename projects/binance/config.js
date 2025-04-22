const ADDRESSES = require('../helper/coreAssets.json')


const chains = require('./chains.json')

const chainBlacklistedTokens = {
  ethereum: [
    '0x9be89d2a4cd102d8fecc6bf9da793be995c22541', // BBTC
    ADDRESSES.ethereum.BNB, // WBNB
  ],
  bsc: [
    // ADDRESSES.null,
    ADDRESSES.bsc.BTCB,
    ADDRESSES.bsc.TUSD
  ],
}
const cexConfig = {
  bep2: {}, // for historical data
}

Object.entries(chains).forEach(([chain, owners]) => {
  cexConfig[chain] = { owners }
  if (chainBlacklistedTokens[chain]) {
    cexConfig[chain].blacklistedTokens = chainBlacklistedTokens[chain]
  }
})

module.exports = cexConfig
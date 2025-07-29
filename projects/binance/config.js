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
  solana: [
    // ADDRESSES.null,
    "7XU84evF7TH4suTuL8pCXxA6V2jrE8jKA6qsbUpQyfCY", // conan
    "CQvadZTR8vikRqqwyhvYV8YpdfCRjUCGyQwCuY4rxBQt"  // conan https://prnt.sc/5rolZ0fF58q0 , broke the others field 
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
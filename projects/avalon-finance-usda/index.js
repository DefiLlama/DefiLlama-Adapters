const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    poolAddress: '0x3f390dD6EF69f68f9877aACC086856a200808693',
    fbtcAddress: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x0b4D6DA52dF60D44Ce7140F1044F2aD5fabd6316',
  },
  bsc: {
    poolAddress: '0xC757E47d6bC20FEab54e16F2939F51Aa4826deF7',
    fbtcAddress: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x8a4bA6C340894B7B1De0F6A03F25Aa6afb7f0224',
  },
  mantle: {
    poolAddress: '0x8f778806CBea29F0f64BA6A4B7724BCD5EEd543E',
    fbtcAddress: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x2BDC204b6d192921605c66B7260cFEF7bE34Eb2E',
  },
}

module.exports = {
  methodology: `FBTC and LFFBTC as collateral`,
}

Object.keys(config).forEach(chain => {
  const {poolAddress, lfbtcAddress, fbtcAddress,} = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: poolAddress, tokens: [lfbtcAddress, fbtcAddress], }),
  }
})
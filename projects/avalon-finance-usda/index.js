const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { mergeExports } = require('../helper/utils')

const config = {
  ethereum: {
    poolAddress: '0x3f390dD6EF69f68f9877aACC086856a200808693',
    fbtcAddress: ADDRESSES.ethereum.FBTC,
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x0b4D6DA52dF60D44Ce7140F1044F2aD5fabd6316',
  },
  bsc: {
    poolAddress: '0xC757E47d6bC20FEab54e16F2939F51Aa4826deF7',
    fbtcAddress: ADDRESSES.bsc.FBTC,
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x8a4bA6C340894B7B1De0F6A03F25Aa6afb7f0224',
  },
  mantle: {
    poolAddress: '0x8f778806CBea29F0f64BA6A4B7724BCD5EEd543E',
    fbtcAddress: ADDRESSES.mantle.FBTC,
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x2BDC204b6d192921605c66B7260cFEF7bE34Eb2E',
  },
  sonic: {
    poolAddress: '0x74476697b5FFd19c8CD9603C01527Dcb987C7418',
    fbtcAddress: ADDRESSES.sonic.FBTC,
    lfbtcAddress: '0x040c10f8238E4689C5E549ef5e07478B738B2BA5',
    usdaAddress: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
  }
}


// Count USDT of USDaMinter Safe Multisig. USDa can be minted by USDT.
// Address: 0x5A79311083dC82aBc2DE1E5639673C876cc6757e
const usdaMinterConfig = {
  ethereum: {
    address: '0x5A79311083dC82aBc2DE1E5639673C876cc6757e',
    usdtAddress: ADDRESSES.ethereum.USDT,
  }
}

module.exports = {
  methodology: `FBTC, LFBTC and USDT as collateral`,
}

const fbtcAndLFBTCTVL= Object.keys(config).forEach(chain => {
  const {poolAddress, lfbtcAddress, fbtcAddress,} = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: poolAddress, tokens: [lfbtcAddress, fbtcAddress], }),
  }
})

const usdaMinterTVL = Object.keys(usdaMinterConfig).forEach(chain => {
  const {address, usdtAddress} = usdaMinterConfig[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: address, tokens: [usdtAddress], }),
  }
})

module.exports = mergeExports(fbtcAndLFBTCTVL, usdaMinterTVL)

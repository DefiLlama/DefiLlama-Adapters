const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const v2Config = {
  ethereum: {
    poolAddress: '0x3f390dD6EF69f68f9877aACC086856a200808693',
    fbtcAddress: ADDRESSES.bob.FBTC,
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x0b4D6DA52dF60D44Ce7140F1044F2aD5fabd6316',
    owners: ['0x5A79311083dC82aBc2DE1E5639673C876cc6757e'],  // Count USDT of USDaMinter Safe Multisig. USDa can be minted by USDT.
    tokens: [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDe, ADDRESSES.ethereum.sUSDe],
  },
  bsc: {
    poolAddress: '0xC757E47d6bC20FEab54e16F2939F51Aa4826deF7',
    fbtcAddress: ADDRESSES.bob.FBTC,
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x8a4bA6C340894B7B1De0F6A03F25Aa6afb7f0224',
  },
  mantle: {
    poolAddress: '0x8f778806CBea29F0f64BA6A4B7724BCD5EEd543E',
    fbtcAddress: ADDRESSES.bob.FBTC,
    lfbtcAddress: '0x3119a1AD5B63A000aB9CA3F2470611eB997B93B9',
    usdaAddress: '0x2BDC204b6d192921605c66B7260cFEF7bE34Eb2E',
  },
  sonic: {
    poolAddress: '0x74476697b5FFd19c8CD9603C01527Dcb987C7418',
    fbtcAddress: ADDRESSES.mantle.FBTC,
    lfbtcAddress: '0x040c10f8238e4689c5e549ef5e07478b738b2ba5',
    usdaAddress: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
  }
}

const v3Config = {
  berachain: {
    poolAddress: '0x02feDCff97942fe28e8936Cdc3D7A480fdD248f0',
    fbtcAddress: ADDRESSES.berachain.WFBTC,
    usdaAddress: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
    treasuryAddress: '0x0c3616027b7d7AC8BA6FA2a1540a5e6A728cebA5',
  }
}

module.exports = {
  methodology: `FBTC, LFBTC and WFBTC as collateral`,
}

// V2
Object.keys(v2Config).forEach(chain => {
  const { poolAddress, lfbtcAddress, fbtcAddress, owners = [], tokens = [] } = v2Config[chain]
  owners.push(poolAddress)
  tokens.push(lfbtcAddress, fbtcAddress)
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens, }),
  }
})

// V3
Object.keys(v3Config).forEach(chain => {
  const { fbtcAddress, treasuryAddress } = v3Config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: [treasuryAddress], tokens: [ fbtcAddress] }),
  }
})

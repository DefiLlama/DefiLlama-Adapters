const { sumTokensExport } = require('../helper/unwrapLPs')

const NATIVE = '0x0000000000000000000000000000000000000000' // convention for native token (ETH/BNB) in sumTokens helpers



const config = {
  ethereum: '0xcf75982da77A13d85919A00aEf290343cada5111',
  bsc:      '0x871F2479cFFddD0210bD2d7AcC21b44D6f9e4ca6',
  arbitrum: '0x833Be2DC319b80365eB53C19932ad2f347c39cD9',
  base:     '0x833Be2DC319b80365eB53C19932ad2f347c39cD9',
}

module.exports = {
  methodology:
    'TVL is the native-token balance (ETH/BNB) currently held by the VortexoFunZK contract on each chain — i.e. deposits that have not yet been withdrawn.',
  ethereum: { tvl: sumTokensExport({ owner: config.ethereum, tokens: [NATIVE] }) },
  bsc:      { tvl: sumTokensExport({ owner: config.bsc,      tokens: [NATIVE] }) },
  arbitrum: { tvl: sumTokensExport({ owner: config.arbitrum, tokens: [NATIVE] }) },
  base:     { tvl: sumTokensExport({ owner: config.base,     tokens: [NATIVE] }) },
}

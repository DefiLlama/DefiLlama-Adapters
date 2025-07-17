const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const BRACKET_ESCROW_PROXY = '0x9b9d7297C3374DaFA2A609d47C79904e467970Bc'

const config = {
  ethereum: {
    tokens: [
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.RETH,
      "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
      ADDRESSES.ethereum.WEETH,
      "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb",
      "0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38",
      ADDRESSES.linea.rzETH,
    ]
  },
  arbitrum: {
    tokens: [
      ADDRESSES.arbitrum.WSTETH,
      "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8",
      ADDRESSES.arbitrum.weETH,
      ADDRESSES.berachain.rsETH,
      ADDRESSES.blast.ezETH
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { owner = BRACKET_ESCROW_PROXY, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, tokens })
  }
})
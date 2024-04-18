const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  ethereum: "0x2ea81946fF675d5Eb88192144ffc1418fA442E28",
  arbitrum: "0x41658B0DaF59Bb2FbB2D9A5249207011d2B364De",
  optimism: "0x41658B0DaF59Bb2FbB2D9A5249207011d2B364De",
  polygon: "0xeEeeb52E36c78b153caaB2761c369a50b066cDD5",
  avax: "0x41658B0DaF59Bb2FbB2D9A5249207011d2B364De",
  bsc: "0x0036E884Cab4F427193839788EDEBB4B92B9a069",
  base: "0x41658B0DaF59Bb2FbB2D9A5249207011d2B364De",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: config[chain], fetchCoValentTokens: true, tokenConfig: { onlyWhitelisted: false, } })
  }
})
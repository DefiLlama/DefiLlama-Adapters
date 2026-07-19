const { sumTokensExport } = require('./helper/unwrapLPs')
const ADDRESSES = require('./helper/coreAssets.json')

const config = {
    avax: {
        tokens: [
            ADDRESSES.avax.DAI,
            ADDRESSES.avax.USDT_e,
            ADDRESSES.avax.USDC,
            ADDRESSES.avax.WBTC_e,
            ADDRESSES.avax.WETH_e,
        ],
    },
    bsc: {
        tokens: [
            ADDRESSES.bsc.DAI,
            ADDRESSES.bsc.USDC,
            ADDRESSES.bsc.USDT,
            ADDRESSES.bsc.BTCB,
            ADDRESSES.bsc.ETH,
        ],
    },
    ethereum: {
        tokens: [
            ADDRESSES.ethereum.DAI,
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.USDT,
            ADDRESSES.ethereum.WBTC,
            ADDRESSES.ethereum.WETH,
            ADDRESSES.ethereum.FRAX,
            ADDRESSES.ethereum.FXS,
        ],
    },
    fantom: {
        tokens: [
            "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
            ADDRESSES.fantom.WBTC,
        ],
    },
    polygon: {
        tokens: [
            ADDRESSES.polygon.DAI,
            ADDRESSES.polygon.USDC,
            ADDRESSES.polygon.USDT,
            ADDRESSES.polygon.WBTC,
            ADDRESSES.polygon.WETH_1,
        ],
    },
}


module.exports = {
  hallmarks: [["2022-05-07", "UST depeg"]],
  everscale: { tvl: () => ({}), },
}
Object.keys(config).forEach(chain => {
  const { tokens, } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: "0x54c55369a6900731d22eacb0df7c0253cf19dfff", tokens })
  }
})

const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  era: {
    tvl: sumTokensExport({
      owner: '0x3ca616C60aAe4c2c067e81DF4B1531e38e602C5a',
      tokens: [
        '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', // USDC
        '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91', // WETH
        '0x493257fD37EDB34451f62EDf8d2a0C418852bA4C'  // USDT
      ]
    }),
  },

  ethereum: {
    tvl: sumTokensExport({
      owner: '0x0Ad3DaE92e136D363864CCd10c794B36922ccEa0',
      tokens: [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'  // WETH
      ]
    }),
  },

  bsc: {
    tvl: sumTokensExport({
      owner: '0x982E680B25c1e0e02b0b84d8f1E008094F200cd5',
      tokens: [
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        '0x55d398326f99059fF775485246999027B3197955', // USDT
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        '0xe9e7cea3dedca5984780bafc599bd69add087d56'  // BUSD
      ]
    }),
  },
}

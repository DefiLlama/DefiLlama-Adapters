const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  blast: { gasline: '0xD5400cAc1D76f29bBb8Daef9824317Aaf9d3C0a1', weth: '0x4300000000000000000000000000000000000004', },
  bsc: { gasline: '0x35138Ddfa39e00C642a483d5761C340E7b954F94', weth: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', },
}

Object.keys(config).forEach(chain => {
  const {gasline, weth} = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: gasline, tokens: [weth] }),
    borrowed: async (_, _b, _cb, { api, }) => {
      const supply = await api.call({  abi: 'erc20:totalSupply', target: gasline})
      api.addGasToken(supply)
    },
  }
})
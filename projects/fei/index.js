const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const uniFei = '0x94B0A3d511b6EcDb17eBF877278Ab030acb0A878'

async function tvl(timestamp, block) {
  const wethBalance = await sdk.api.erc20.balanceOf({
    target: weth,
    owner: uniFei,
    block
  })
  return {
    [weth]: wethBalance.output
  }
}

module.exports = {
  name: 'Fei',
  token: 'FEI',
  category: 'Assets',
  start: 0, // WRONG!
  tvl
}
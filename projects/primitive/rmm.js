const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

module.exports = async function tvl(_, block) {
  const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const engine = '0xd3541aD19C9523c268eDe8792310867C57BE39e4' // WETH-USDC Pair

  const balances = (
    await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: [
        {
          target: weth,
          params: engine,
        },
        {
          target: usdc,
          params: engine,
        },
      ],
      block,
    })
  ).output

  return {
    [`${weth}`]: new BigNumber(balances[0].output),
    [`${usdc}`]: new BigNumber(balances[1].output),
  }
}

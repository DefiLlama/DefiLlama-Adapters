const ADDRESSES = require('../helper/coreAssets.json')
const WHLP_VAULT = '0x1359b05241cA5076c9F59605214f4F84114c0dE8'
const WHLP_ACCOUNTANT = '0x470bd109A24f608590d85fc1f5a4B6e625E8bDfF'
const USDT0 = ADDRESSES.corn.USDT0

const totalSupplyAbi = 'function totalSupply() view returns (uint256)'
const exchangeRateAbi = 'function getRate() view returns (uint256)'


const tvl = async (api) => {
  const [whlpTotalSupply, whlpExchangeRate,] = await Promise.all([
    api.call({ target: WHLP_VAULT, abi: totalSupplyAbi }),
    api.call({ target: WHLP_ACCOUNTANT, abi: exchangeRateAbi, }),
  ])

  const whlpTotalValueInUsdt0 = whlpTotalSupply * whlpExchangeRate / 1e6

  api.add(USDT0, whlpTotalValueInUsdt0)

}

module.exports = {
  hyperliquid: { tvl },
  misrepresentedTokens: true,
  methodology:
    "The total USD value of assets in strategy positions held by the wHLP vault.",
}

const ADDRESSES = require('../helper/coreAssets.json')
const LHYPE_VAULT = '0x5748ae796AE46A4F1348a1693de4b50560485562'

const LHYPE_ACCOUNTANT = '0xcE621a3CA6F72706678cFF0572ae8d15e5F001c3'

const WHYPE = ADDRESSES.hyperliquid.WHYPE

const totalSupplyAbi = 'function totalSupply() view returns (uint256)'
const exchangeRateAbi = 'function getRate() view returns (uint256)'

const tvl = async (api) => {
  const [lhypeTotalSupply, lhypeExchangeRate,] = await Promise.all([
    api.call({ target: LHYPE_VAULT, abi: totalSupplyAbi }),
    api.call({ target: LHYPE_ACCOUNTANT, abi: exchangeRateAbi, }),
  ])

  const lhypeTotalValueInHype = lhypeTotalSupply * lhypeExchangeRate / 1e18

  api.add(WHYPE, lhypeTotalValueInHype)
}

module.exports = {
  hyperliquid: { tvl },
  methodology: 'The total value of assets deployed across all LHYPE and WHLP strategies.',
  misrepresentedTokens: true,
}

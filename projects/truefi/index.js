const abi = require('./abi.json')
const { staking } = require('../helper/staking')

const stkTRU = '0x23696914Ca9737466D8553a2d619948f548Ee424'
const TRU = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784'
const managedPortfolioFactory = '0x17b7b75FD4288197cFd99D20e13B0dD9da1FF3E7'
const assetVaultFactory = '0x5Def383172C7dFB6F937e32aDf5be4D252168eDA'
const alocVaultFactory = '0x1672f101be9FfE121AfF7514B373e956272fe249'

const alocVaultFactoryArbitrum = '0xCA1353dAB799d87D70E3750c2280205A5c8f62e9'

const pools = [
  '0x97cE06c3e3D027715b2d6C22e67D5096000072E5', // TUSD
  '0x6002b1dcB26E7B1AA797A17551C6F487923299d7', // USDT
  '0xA991356d261fbaF194463aF6DF8f0464F8f1c742', // USDC
  '0x1Ed460D149D48FA7d91703bf4890F97220C09437', // BUSD
]

async function getAllTvl(api, isBorrowed) {

  const tokens = await api.multiCall({ calls: pools, abi: abi.token, })
  const currencyBalance = await api.multiCall({ calls: pools, abi: abi.currencyBalance, })
  const loansValue = await api.multiCall({ calls: pools, abi: abi.loansValue, })

  const portfolios = await api.call({ target: managedPortfolioFactory, abi: abi.getPortfolios, })
  const underlyingToken = await api.multiCall({ calls: portfolios, abi: abi.underlyingToken, })
  const liquidValue = await api.multiCall({ calls: portfolios, abi: abi.liquidValue, })
  const illiquidValue = await api.multiCall({ calls: portfolios, abi: abi.illiquidValue, })

  const assetVaults = await api.call({ target: assetVaultFactory, abi: abi.getAssetVaults, })
  const avUnderlyingTokens = await api.multiCall({ calls: assetVaults, abi: abi.asset, })
  const avLiquidAssets = await api.multiCall({ calls: assetVaults, abi: abi.liquidAssets, })
  const avIlliquidAssets = await api.multiCall({ calls: assetVaults, abi: abi.outstandingAssets, })

  const alocVaults = await api.call({target: alocVaultFactory, abi: abi.getAlocVaults})
  const alocUnderlyingTokens = await api.multiCall({calls: alocVaults, abi: abi.asset})
  const alocLiquidAssets = await api.multiCall({calls: alocVaults, abi: abi.liquidAssets})
  const alocIlliquidAssets = await api.multiCall({calls: alocVaults, abi: abi.borrowedAssets})

  if (!isBorrowed) {
    api.addTokens(tokens, currencyBalance)
    api.addTokens(underlyingToken, liquidValue)
    api.addTokens(avUnderlyingTokens, avLiquidAssets)
    api.addTokens(alocUnderlyingTokens, alocLiquidAssets)
  } else {
    api.addTokens(tokens, loansValue)
    api.addTokens(underlyingToken, illiquidValue)
    api.addTokens(avUnderlyingTokens, avIlliquidAssets)
    api.addTokens(alocUnderlyingTokens, alocIlliquidAssets)
  }
}

async function getArbitrumTvl(api, isBorrowed) {
  const alocVaults = await api.call({target: alocVaultFactoryArbitrum, abi: abi.getAlocVaults, chain: 'arbitrum'})
  const alocUnderlyingTokens = await api.multiCall({calls: alocVaults, abi: abi.asset, chain: 'arbitrum'})
  const alocLiquidAssets = await api.multiCall({calls: alocVaults, abi: abi.liquidAssets, chain: 'arbitrum'})
  const alocIlliquidAssets = await api.multiCall({calls: alocVaults, abi: abi.borrowedAssets, chain: 'arbitrum'})

  if(!isBorrowed) {
    api.addTokens(alocUnderlyingTokens, alocLiquidAssets)
  } else {
    api.addTokens(alocUnderlyingTokens, alocIlliquidAssets)
  }

}

async function borrowed(api) {
  return getAllTvl(api, true)
}

async function tvl(api) {
  return getAllTvl(api, false)
}

async function borrowedArbitrum(api) {
  return getArbitrumTvl(api, true)
}

async function tvlArbitrum(api) {
  return getArbitrumTvl(api, false)
}

module.exports = {
  start: '2020-11-20',            // 11/20/2020 @ 12:00am (UTC)
  ethereum: {
    tvl,
    staking: staking(stkTRU, TRU),
    borrowed,
  },
  arbitrum: {
    tvl: tvlArbitrum,
    borrowed: borrowedArbitrum,
  }
}
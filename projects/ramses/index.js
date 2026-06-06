const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const RAM = '0x555570a286F15EbDFE42B66eDE2f724Aa1AB5555'
const XRAM = '0xAE6D5FcE541216BDA471D311425B5412D9f1DEb9'

const legacyOptions = { useDefaultCoreAssets: true, hasStablePools: true }

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ ...legacyOptions, factory: '0xAAA20D08e59F6561f242b08513D36266C5A29415', stablePoolSymbol: 'crAMM' }),
      getUniTVL({ ...legacyOptions, factory: '0xADd32480630A16dfAcEe6eeFcB3ab2181449Dc3B', stablePoolSymbol: 'cAMM' }),
    ]),
  },
  hyperliquid: {
    tvl: getUniTVL({ ...legacyOptions, factory: '0xd0a07E160511c40ccD5340e94660E9C9c01b0D27', stablePoolSymbol: 'cAMM' }),
    staking: staking(XRAM, RAM),
  },
  polygon: {
    tvl: getUniTVL({ ...legacyOptions, factory: '0xA87c8308722237F6442Ef4762B7287afB84fB191', stablePoolSymbol: 'cAMM' }),
  },
}

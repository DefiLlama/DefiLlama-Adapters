const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const FORGE_SOL = '0x4938D2016e7446a24b07635611bD34289Df42ECb'
const USDC_TOKEN = ADDRESSES.arbitrum.USDC

module.exports = {
  methodology: 'counts the number of USDC tokens deposited as collateral in the Forge.sol contract.',
  start: '2023-04-04',
  arbitrum: {
    tvl: sumTokensExport({ owner: FORGE_SOL, tokens: [USDC_TOKEN]}),
  }
};
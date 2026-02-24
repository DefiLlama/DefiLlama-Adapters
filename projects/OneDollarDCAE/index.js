const { sumTokensExport } = require('../helper/unwrapLPs')
const ONE_DOLLAR_DCAE_CONTRACT = '0xA87619dEFaa9b63F5D78eA69a4fBAdEa7341347e'; // OneDollarDCAE contract address
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Counts the USDC and WETH held in the OneDollarDCAE contract.',
  start: 305469991, // The actual block number when the contract was deployed
  arbitrum: {
    tvl: sumTokensExport({ owner: ONE_DOLLAR_DCAE_CONTRACT, tokens: [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC_CIRCLE] }),
  }
};

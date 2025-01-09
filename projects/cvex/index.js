const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const MAIN_CONTRACT = '0xBe14D34ce8737614331cE1904AA659E26657eE85'; // Main Contract Address (Proxy)

module.exports = {
  methodology: 'counts the USDC balance in the main contract on Arbitrum.',
  arbitrum: {
    tvl: sumTokensExport({ owner: MAIN_CONTRACT, tokens: [ADDRESSES.arbitrum.USDC_CIRCLE] }),
  },
}
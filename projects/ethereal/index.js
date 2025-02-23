const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const VAULT = '0x90d2af7d622ca3141efa4d8f1f24d86e5974cc8f'

module.exports = {
  methodology: 'TVL includes USDe tokens locked in Ethereal’s Season Zero vault on Ethereum.',
  ethereum: { tvl: sumTokensExport({ owner: VAULT, tokens: [ADDRESSES.ethereum.USDe] }) },
}

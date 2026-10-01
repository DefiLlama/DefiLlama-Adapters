const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const PORTAL = '0xdf410ad448A0f7165181FBdB32f8896f4a0d9449'

module.exports = {
  start: '2026-09-25',
  methodology: 'TVL is the DAI held in zk.money\'s Ethereum portal, which backs private DAI balances on Aztec. USDC and USDT deposits are swapped to DAI before entering the portal.',
  ethereum: {
    tvl: sumTokensExport({ owner: PORTAL, tokens: [ADDRESSES.ethereum.DAI] }),
  },
}

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const OWNER = '0x23317197cf82a14d7b7a671c23b94d39f6a2fa22'

module.exports = {
  methodology:
    'TVL counts the USDC (Vault Bridge USDC) held in the Katana Perps contract on the Katana chain.',
  katana: {
    tvl: sumTokensExport({ owner: OWNER, tokens: [ADDRESSES.katana.VB_USDC] }),
  },
}

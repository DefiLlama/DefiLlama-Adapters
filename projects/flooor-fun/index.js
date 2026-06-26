const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const FLOOOR_CONTRACT = '0xF6B2C2411a101Db46c8513dDAef10b11184c58fF'

module.exports = {
  methodology: 'TVL is the native ETH held in the flooor.fun auction contract on Base, comprising the current highest bid locked in escrow (activebidAM) plus accumulated epoch pool rewards (poolAccrued). ETH exits the contract when sellToHighest() is called, distributing 99.5% to the NFT seller and 0.5% fee to the protocol.',

  base: {
    tvl: sumTokensExport({
      owners: [FLOOOR_CONTRACT],
      tokens: [ADDRESSES.null],
    }),
  },
}

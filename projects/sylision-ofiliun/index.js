const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

// Sylision Ofiliun — P2P secondary marketplace for locked staking positions
// Sellers exit early for USDC; buyers acquire positions at a discount (10-40% APY)
// https://app.sylision.com | Arbitrum One

const POSITION_ESCROW = '0xfB5A9eDbCf439529B523791d9cD77C2f066c6e8a'

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owner: POSITION_ESCROW,
      tokens: [
        ADDRESSES.arbitrum.USDC_CIRCLE, // native USDC (Circle)
        ADDRESSES.arbitrum.USDC,        // bridged USDC.e
      ],
    }),
  },
  methodology: 'TVL is measured as the total USDC held in the PositionEscrow contract on Arbitrum One, representing locked buyer capital committed to staking exit positions.',
}

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const CHAIN = 'bittorrent'

// Tokens
const ETH = ADDRESSES.bittorrent.ETH
const USDC_T = ADDRESSES.bittorrent.USDC_t
const TRX = ADDRESSES.bittorrent.TRX

// Bitlend Markets
const bETH = '0xb65103C4B2Af563F9bBD8ad8CA8387d700673B6E'
const bUSDC_T = '0xd1dA3881282a954E7FCd5a23c89AF2978FCEFcF0'
const bTRX = '0xE73fb086C7Aa48b83372b028f0f35B06E77C7511'

module.exports = {
  methodology: 'Total staked tokens in Bitlend protocol.',
  deadFrom: 1675036800,
  bittorrent: {
    tvl: sumTokensExport({
      chain: CHAIN,
      tokensAndOwners: [
        [ETH, bETH],
        [USDC_T, bUSDC_T],
        [TRX, bTRX],
      ],
    })
  }
}



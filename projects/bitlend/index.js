const { sumTokensExport } = require('../helper/unwrapLPs')

const CHAIN = 'bittorrent'

// Tokens
const ETH = '0x1249C65AfB11D179FFB3CE7D4eEDd1D9b98AD006'
const USDC_T = '0x935faA2FCec6Ab81265B301a30467Bbc804b43d3'
const TRX = '0xEdf53026aeA60f8F75FcA25f8830b7e2d6200662'

// Bitlend Markets
const bETH = '0xb65103C4B2Af563F9bBD8ad8CA8387d700673B6E'
const bUSDC_T = '0xd1dA3881282a954E7FCd5a23c89AF2978FCEFcF0'
const bTRX = '0xE73fb086C7Aa48b83372b028f0f35B06E77C7511'

module.exports = {
  methodology: 'Total staked tokens in Bitlend protocol.',
  start: 14069919,
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

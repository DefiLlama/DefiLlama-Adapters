// Ellipse v3 pools on Arc. Only the non-bridged side (USDC, ELLIPSE) is counted: the bridged tokens
// (bCRCL, bGLD, bUSDT, bBTCB) are 1:1 claims on reserves already counted by ellipse-bridge under the same parent.
// Uniswap v4 pools are not counted: v4 keeps every pool's reserves in one shared PoolManager, so its
// balance is not attributable to Ellipse on a chain with several v4 deployers.
const USDC = '0x3600000000000000000000000000000000000000'
const ELLIPSE = '0x86F7424C3e1EBb3F42e1E687468e36D5f2A1222E'

const USDC_POOLS = [
  '0x8b3F1194F8a2D067fa91D2E8073b27B710062347', // CRCL/USDC 1%
  '0xC4bB8F51E1732e80d16929180e2A9387E8A0C4e1', // GLD/USDC 1%
  '0xfD938605b706883216b3CF859C5209B9C6E2Bcd5', // USDT/USDC 1%
  '0x376D2128728E949d5dbFC4E1780c8a5c6799236C', // USDT/USDC 0.3%
  '0xe5ca3eF671dd895eE86392024acF42f065f4b821', // BTCB/USDC 1%
  '0x7C7B96B200c1C518a615cbF3e956254b3a51F1A4', // BTCB/USDC 0.3%
]
const ELLIPSE_POOL = '0x0Abd501F56CD434D346CD5Bf3B67aEF461ebBc2d' // ELLIPSE/bCRCL 1%

async function tvl(api) {
  const tokensAndOwners = USDC_POOLS.map(pool => [USDC, pool])
  tokensAndOwners.push([ELLIPSE, ELLIPSE_POOL])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: 'Counts the non-bridged liquidity (USDC and ELLIPSE) in the Ellipse v3 pools on Arc. The bridged tokens in those pools are claims on reserves already counted by Ellipse Bridge, so they are excluded to avoid double counting. Uniswap v4 liquidity is not counted, since the shared PoolManager balance cannot be attributed to Ellipse.',
  arc: { tvl },
}

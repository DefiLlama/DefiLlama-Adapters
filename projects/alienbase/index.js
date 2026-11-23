const { getUniTVL } = require('../helper/unknownTokens')

const ALB = '0x1b23704e3f4bc7081fb00cec582183e3fe43cef7'
const LEGACY_ALB = '0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4'
const STAKING_CONTRACT = '0x28a3c9852383eef436a874b74d2acf23047e85cf'
const LEGACY_ESCROWS = [
  '0x365c6d588e8611125De3bEA5B9280C304FA54113', // legacy esALB
  '0x52eaeCAC2402633d98b95213d0b473E069D86590', // legacy masterchef BasedDistributorV2
]

// esALB and govALB have no price; staking shares are 1:1 with them and they are 1:1 with ALB
async function staking(api) {
  const totalShares = await api.call({ target: STAKING_CONTRACT, abi: 'uint256:totalShares' })
  api.add(ALB, totalShares)
  return api.sumTokens({ owners: LEGACY_ESCROWS, tokens: [LEGACY_ALB] })
}

module.exports = {
  methodology: 'TVL is the tokens in V2 pairs. Staking is esALB and govALB shares, counted 1:1 as ALB, plus legacy ALB still escrowed until migration closes.',
  base: {
    tvl: getUniTVL({ factory: '0x3E84D913803b02A4a7f027165E8cA42C14C0FdE7', useDefaultCoreAssets: true }),
    staking,
  },
}

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "Counting the value of all tokens locked in the contracts to be used as collateral to trade or provide liquidity.",
  era: { tvl: sumTokensExport({ owner: '0xfc840c55b791a1dbaf5c588116a8fc0b4859d227', tokens: [ADDRESSES.era.USDC] }) },
  start: '2024-03-09' // 2024-03-09 09:10
}
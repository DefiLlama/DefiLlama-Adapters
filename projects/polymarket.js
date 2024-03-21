const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensExport } = require('./helper/unwrapLPs');

module.exports = {
  polygon: {
    tvl: sumTokensExport({ owner: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045', tokens: [ADDRESSES.polygon.USDC]})
  },
  methodology: `TVL is the total quantity of USDC held in the conditional tokens contract as well as USDC collateral submitted to every polymarket' markets ever opened - once the markets resolve, participants can withdraw theire share given the redeption rate and their input stake, but they do not all do it.`
}

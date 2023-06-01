const sdk = require('@defillama/sdk');
const { aaveChainTvl } = require('../helper/aave');
const { usdCompoundExports } = require('../helper/compound')

function v2(chain, v2Registry){
  const section = borrowed => sdk.util.sumChainTvls([
    aaveChainTvl(chain, v2Registry, undefined, undefined, borrowed),
  ])
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  polygon_zkevm: v2("polygon_zkevm", "0x4Dac514F520D051551372d277d1b2Fa3cF2AfdFF"),
  rsk: {
    ...usdCompoundExports("0x962308fEf8edFaDD705384840e7701F8f39eD0c0", "rsk"),
  }
};
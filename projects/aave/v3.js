const { aaveChainTvl } = require('../helper/aave');

const v3params = ["0x770ef9f4fe897e59daCc474EF11238303F9552b6", undefined, ["0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654"]]

function v3(chain){
    const section = borrowed => aaveChainTvl(chain, ...v3params, borrowed, true);
    return {
      tvl: section(false),
      borrowed: section(true)
    }
  }
  
  module.exports = {
    timetravel: true,
    methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
    avalanche: v3("avax"),
    ...["optimism", "fantom", "harmony", "arbitrum", "polygon"].reduce((t, c)=>({...t, [c]:v3(c)}), {})
  };
  // node test.js projects/aave/index.js
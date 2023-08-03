const { aaveChainTvl } = require('../helper/aave');

const v3params = ["0x770ef9f4fe897e59daCc474EF11238303F9552b6", undefined, ["0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654"]]

function v3(chain) {
  let params = v3params
  if (chain === 'ethereum')
    params = ['0xbaA999AC55EAce41CcAE355c77809e68Bb345170', undefined, ['0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3']]
  else if (chain === 'metis')
    params = ['0x9E7B73ffD9D2026F3ff4212c29E209E09C8A91F5', undefined, ['0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8']]
  const section = borrowed => aaveChainTvl(chain, ...params, borrowed, true);
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  avax: v3("avax"),
  ...["optimism", "fantom", "harmony", "arbitrum", "polygon", "ethereum", "metis"].reduce((t, c) => ({ ...t, [c]: v3(c) }), {}),
  hallmarks: [
    [1659630089, "Start OP Rewards"],
    [1650471689, "Start AVAX Rewards"]
  ],
};
// node test.js projects/aave/index.js

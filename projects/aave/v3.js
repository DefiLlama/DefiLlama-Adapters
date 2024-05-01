const { aaveChainTvl } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

const v3params = ["0x770ef9f4fe897e59daCc474EF11238303F9552b6", undefined, ["0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654"]]

function v3(chain) {
  let params = v3params
  if (chain === 'ethereum')
    params = ['0xbaA999AC55EAce41CcAE355c77809e68Bb345170', undefined, ['0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3']]
  else if (chain === 'metis')
    params = ['0x9E7B73ffD9D2026F3ff4212c29E209E09C8A91F5', undefined, ['0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8']]
  else if (chain === 'base')
    params = ['0x2f6571d3Eb9a4e350C68C36bCD2afe39530078E2', undefined, ['0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac']]
  else if (chain === 'xdai')
    params = ['0x36616cf17557639614c1cdDb356b1B83fc0B2132', undefined, ['0x501B4c19dd9C2e06E94dA7b6D5Ed4ddA013EC741']]
  else if (chain === 'scroll')
    params = ['0xFBedc64AeE24921cb43004312B9eF367a4162b57', undefined, ['0xa99F4E69acF23C6838DE90dD1B5c02EA928A53ee']]
  else if (chain === 'bsc')
    params = ['0x117684358D990E42Eb1649E7e8C4691951dc1E71', undefined, ['0x41585C50524fb8c3899B43D7D797d9486AAc94DB']]
  const section = borrowed => aaveChainTvl(chain, ...params, borrowed, true);
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  methodology: methodologies.lendingMarket,
  avax: v3("avax"),
  ...["optimism", "fantom", "harmony", "arbitrum", "polygon", "ethereum", "metis", "base", "xdai", "scroll", "bsc"].reduce((t, c) => ({ ...t, [c]: v3(c) }), {}),
  hallmarks: [
    [1659630089, "Start OP Rewards"],
    [1650471689, "Start AVAX Rewards"]
  ],
};
// node test.js projects/aave/index.js

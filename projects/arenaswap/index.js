const arena = "0x2A17Dc11a1828725cdB318E0036ACF12727d27a2";
const pyram = "0xedeCfB4801C04F3EB394b89397c6Aafa4ADDa15B";
const poolInfo = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accArenaPerShare, uint16 depositFeeBP, uint256 harvestInterval)'

const { masterchefExports, } = require('../helper/unknownTokens');
const { mergeExports } = require('../helper/utils');

module.exports = mergeExports([
  masterchefExports({
    chain: 'bsc',
    masterchef: '0xbEa60d145747a66CF27456ef136B3976322b7e77',
    nativeTokens: [arena, pyram],
  }),
  masterchefExports({
    chain: 'bsc',
    masterchef: '0x3e91B21ddE13008Aa73f07BdE26970322Fe5D533',
    nativeTokens: [arena, pyram],
  })
])

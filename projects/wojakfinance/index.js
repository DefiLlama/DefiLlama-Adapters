const { getUniTVL, staking } = require('../helper/unknownTokens')

const MasterChefContract = "0x065AAE6127D2369C85fE3086b6707Ac5dBe8210a";
const WojkPoolContract = "0xDF21058099e69D3635005339721C4826c4c47F8A";
const WOJK = "0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD";

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      factory: '0xc7c86B4f940Ff1C13c736b697e3FbA5a6Bc979F9', chain: 'dogechain', useDefaultCoreAssets: true,
    }),
    staking: staking({ owner: WojkPoolContract, tokens: [ WOJK ], chain: 'dogechain', lps: ['0xC1FaBe61B9cFC005a51e1Ea899C3D65fb6392497'], useDefaultCoreAssets: true, })
  },
};
        
 



const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const DACKIE = "0x73326b4d0225c429bed050c11C4422d91470AaF4";

const stakingPools = [
  // Lock & flexible pool
  "0xF6C5b5Df9Bcee40cd474CCd6373f99b56dBCF5E5",
];
const config = {
  xlayer: '0x757cd583004400ee67e5cc3c7a60c6a62e3f6d30',
  optimism: '0xaedc38bd52b0380b2af4980948925734fd54fbf4',
  arbitrum: '0x507940c2469e6e3b33032f1d4ff8d123bdde2f5c',
  blast: '0xf5190e64db4cbf7ee5e72b55cc5b2297e20264c2',
  inevm: '0x507940c2469e6e3b33032f1d4ff8d123bdde2f5c',
  mode: '0x757cd583004400ee67e5cc3c7a60c6a62e3f6d30',
  base: '0x591f122D1df761E616c13d265006fcbf4c6d6551',
  linea: '0x9790713770039CeFcf4FAaf076E2846c9B7a4630',
  wc: '0x757cD583004400ee67e5cC3c7A60C6a62E3F6d30',
  ethereum: '0x3D237AC6D2f425D2E890Cc99198818cc1FA48870',
  unichain: '0x507940c2469e6E3B33032F1d4FF8d123BDDe2f5C',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true })
  }
})

module.exports.base.staking = stakings(stakingPools, DACKIE)

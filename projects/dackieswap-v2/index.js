const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const DACKIE = "0xc2BC7A73613B9bD5F373FE10B55C59a69F4D617B";

const stakingPools = [
  // Lock & flexible pool
  "0x4Ad387bcb03B92a6e22A72391Cc37493Fc388B05",
];
const config = {
  xlayer: '0x757cd583004400ee67e5cc3c7a60c6a62e3f6d30',
  optimism: '0xaedc38bd52b0380b2af4980948925734fd54fbf4',
  arbitrum: '0x507940c2469e6e3b33032f1d4ff8d123bdde2f5c',
  blast: '0xf5190e64db4cbf7ee5e72b55cc5b2297e20264c2',
  inevm: '0x507940c2469e6e3b33032f1d4ff8d123bdde2f5c',
  mode: '0x757cd583004400ee67e5cc3c7a60c6a62e3f6d30',
  base: '0x591f122D1df761E616c13d265006fcbf4c6d6551',
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

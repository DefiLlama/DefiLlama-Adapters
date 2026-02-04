const { getUniTVL, } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x3e723c7b6188e8ef638db9685af45c7cb66f77b9'}),
    staking: staking("0x6bf16B2645b13db386ecE6038e1dEF76d95696fc", "0xb3A8F0f0da9ffC65318aA39E55079796093029AD"),
  },
}

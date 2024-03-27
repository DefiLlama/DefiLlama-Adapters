const { uniTvlExport, sumTokensExport, } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = uniTvlExport('core', '0x3e723c7b6188e8ef638db9685af45c7cb66f77b9')
module.exports.core.staking = sumTokensExport({ owner: "0x6bf16B2645b13db386ecE6038e1dEF76d95696fc", tokens: [ADDRESSES.null, "0xb3A8F0f0da9ffC65318aA39E55079796093029AD"], lps: ['0x40320a9b3e8458ce3dd3e0ad79fc5208f00510a3'], useDefaultCoreAssets: true, })
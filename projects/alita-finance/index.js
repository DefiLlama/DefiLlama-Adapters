const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const ALI_TOKEN = '0x557233E794d1a5FbCc6D26dca49147379ea5073c'
const ALI_FACTORY = "0xC7a506ab3ac668EAb6bF9eCf971433D6CFeF05D9";
const ALI_MASTER_CHEF = '0x4f7b2Be2bc3C61009e9aE520CCfc830612A10694'

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory: ALI_FACTORY, useDefaultCoreAssets: true,}),
    staking: staking(ALI_MASTER_CHEF, ALI_TOKEN),
  }
}
const { aaveV2Export } = require('../helper/aave')
const { sumTokensExport } = require("../helper/unknownTokens")

const POLTER_CONTRACT = '0x5c725631FD299703D0A74C23F89a55c6B9A0C52F'
const MULTIFEE_CONTRACT = '0xb0F8fe472422Ae582a535b5418C82Ff0F9fa9267'
const POLTER_LP_CONTRACT = '0x44C85D45EB17C8A6b241807BE5c9c48201F91837'

module.exports = {
  fantom: aaveV2Export('0x867fAa51b3A437B4E2e699945590Ef4f2be2a6d5'),
}

module.exports.fantom.staking = sumTokensExport({ owner: MULTIFEE_CONTRACT, tokens: [POLTER_CONTRACT], lps: [POLTER_LP_CONTRACT], useDefaultCoreAssets: true, })
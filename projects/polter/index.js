const { aaveV2Export } = require('../helper/aave')
const { sumTokensExport } = require("../helper/unknownTokens")

const fantom = {
  POLTER_CONTRACT: '0x5c725631FD299703D0A74C23F89a55c6B9A0C52F',
  MULTIFEE_CONTRACT: '0xb0F8fe472422Ae582a535b5418C82Ff0F9fa9267',
  POLTER_LP_CONTRACT: '0x44C85D45EB17C8A6b241807BE5c9c48201F91837',
  POLTER_LENDINGPOOL_CONTRACT: '0x867fAa51b3A437B4E2e699945590Ef4f2be2a6d5'
}

const base = {
  POLTER_CONTRACT: '0xA0820613976B441E2c6A90E4877E2fb5f7D72552',
  MULTIFEE_CONTRACT: '0x0B7B45A920Ae54f066b6c013fEdF27C37840dE38',
  POLTER_LP_CONTRACT: '0xee7ef14845c466b30f7f4a41f5491df8824cb64e',
  POLTER_LENDINGPOOL_CONTRACT: '0x33CA62504cebAB919f0FCa94562413ee121A9798'
}


module.exports = {
  hallmarks: [
    [1731715200,"Price Oracle Exploit"]
  ],
  fantom: aaveV2Export(fantom.POLTER_LENDINGPOOL_CONTRACT),
  base: aaveV2Export(base.POLTER_LENDINGPOOL_CONTRACT),  
}

module.exports.fantom.staking = sumTokensExport({ owner: fantom.MULTIFEE_CONTRACT, tokens: [fantom.POLTER_CONTRACT], lps: [fantom.POLTER_LP_CONTRACT], useDefaultCoreAssets: true, })
module.exports.base.staking = sumTokensExport({ owner: base.MULTIFEE_CONTRACT, tokens: [base.POLTER_CONTRACT], lps: [base.POLTER_LP_CONTRACT], useDefaultCoreAssets: true, })

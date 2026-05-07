const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = '88QishokZbUicErBP4kF18KGXeURo4iTQ9651gkiHk8y' //(Treasury)
const ecosystemGrowth = '2cxoaTUEW3CnSXx4fWK4SscJqGaem4CrYmqupSFVsjEs' //(Ecosystem Growth)
const nodeEmissions = 'NzHcrCaL1CoE7RNaArmtaoSuJnoSqedfsjTe1C13LSr' //(Node Emissions & Incentives)
const checkerRewardsVault = 'BNePhTKwPp1fEM7xKDbzd6xBbevCab5brB1gi1CNYRUx' //(Checker Rewards Vault)

const BMB = 'BMBtwz6LFDJVJd2aZvL5F64fdvWP3RPn4NP5q9Xe15UD'

module.exports = treasuryExports({
  solana: {
    tokens: [
      nullAddress,
    ],
    owners: [treasury, ecosystemGrowth, nodeEmissions, checkerRewardsVault],
    ownTokens: [BMB],
  },
})
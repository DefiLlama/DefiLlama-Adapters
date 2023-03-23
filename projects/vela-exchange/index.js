const { staking } = require("../helper/staking")

module.exports = {
  methodology: "Counts USDC deposited to trade and to mint VLP. Staking counts VELA deposited to earn eVELA",
  arbitrum: {
    tvl: staking('0x5957582f020301a2f732ad17a69ab2d8b2741241', '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'),
    staking: staking('0xfC527781Ae973f8131dC26dDDb2Adb080c1C1F59', '0x088cd8f5eF3652623c22D48b1605DCfE860Cd704'),
  },
}
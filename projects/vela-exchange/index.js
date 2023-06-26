const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking")

module.exports = {
  methodology: "Counts USDC deposited to trade and to mint VLP. Staking counts VELA deposited to earn eVELA",
  arbitrum: {
    tvl: staking('0xC4ABADE3a15064F9E3596943c699032748b13352', ADDRESSES.arbitrum.USDC),
    staking: staking('0xfC527781Ae973f8131dC26dDDb2Adb080c1C1F59', '0x088cd8f5eF3652623c22D48b1605DCfE860Cd704'),
  },
  hallmarks: [
    [Math.floor(new Date('2023-04-13')/1e3), 'Refunded tokens to VLP holders & traders'],
  ],
}
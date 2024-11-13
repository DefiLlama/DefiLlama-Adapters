const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { pool2 } = require('../helper/pool2')
const { staking } = require('../helper/staking')

let share = "0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa";
const rewardPool = "0xA51054BDf0910E3cE9B233e6B5BdDc0931b2E2ED";
const masonry = "0x2CcbFD9598116cdF9B94fF734ece9dCaF4c9d471";
const pool2LPs = [
  "0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0",
  "0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677",
]

async function tvl(api) {
  await sumTokens2({
    api, tokens: [
      "0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0",
      "0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677",
      "0x97749c9B61F878a880DfE312d2594AE07AEd7656",
      "0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7",
      ADDRESSES.cronos.WCRO_1,
      "0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03",
    ], owner: '0x3827CAa33557304e1CA5D89c2f85919Da171C44D', resolveLP: true
  })
  api.removeTokenBalance(ADDRESSES.cronos.SVN)
}
module.exports = {
  cronos: {
    tvl,
    pool2: pool2(rewardPool, pool2LPs),
    staking: staking(masonry, share),
  }
};
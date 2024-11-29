const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const tresury = "0x146dd6E8f9076dfEE7bE0b115bb165d62874d110";
const rewardPool = '0x8E629C4301871d2A07f76366FE421e86855DC690';


module.exports = {
  methodology: `We count the WFTM on treasuty and reward pool`,
  fantom: {
    tvl: sumTokensExport({ token: ADDRESSES.fantom.WFTM, owners: [tresury, rewardPool] })
  }
}
const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

const earlyfansV1contract = "0x4b17a9318238403ddac8E3a790C3b06D18132Bf4";
const earlyTokenContract = "0x7135B32e9903BdB4e19a8b1D22fC2038964B8451";
const earlyfansV2promisesContract = "0x169BC25B709f05c69daE264487cd84Be526AFb9a";
const earlyfansV2bribesContract = "0x55BcC767F4ADD89BB7C316C560701A0a331DF746"

async function tvl(api) {
  return sumTokens2({ tokens: [ADDRESSES.null], owners: [earlyfansV1contract, earlyfansV2promisesContract, earlyfansV2bribesContract], api });
}

module.exports = {
  methodology: `TVL counts the EARLY on ${earlyTokenContract} and ETH on ${earlyfansV1contract}, ${earlyfansV2promisesContract} and ${earlyfansV2bribesContract}.`,
  blast: {
    tvl,
    staking: staking(earlyfansV1contract, earlyTokenContract) // early token
  },
};

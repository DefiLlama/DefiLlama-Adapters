const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

// Curves main contract
const CURVES_CONTRACT = "0xEad4138380B508949Ccd48B97AD930bd89aAb719"

// CurvesGroups contract
const CURVES_GROUPS_CONTRACT = "0x88c7484d19E49B09233484824698a5214d81f866"

async function tvl(api) {
  return sumTokens2({
    tokens: [nullAddress],
    owners: [CURVES_CONTRACT, CURVES_GROUPS_CONTRACT],
    api
  })

}

module.exports = {
  methodology: `We count the ETH locked in the Curves trading contracts (${CURVES_CONTRACT}, ${CURVES_GROUPS_CONTRACT})`,
  formnetwork: {
    tvl
  }
}

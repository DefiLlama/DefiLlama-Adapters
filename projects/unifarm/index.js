const { sumTokens2 } = require('../helper/unwrapLPs')
const {
  getV1Calls,
  getV2Calls,
  createCallForSetu,
  chains,
} = require("./helper");

async function tvl(api) {
  const tokensAndOwners = []
  tokensAndOwners.push(...await getV1Calls(api.chain))
  tokensAndOwners.push(...await getV2Calls(api.chain))
  tokensAndOwners.push(...await createCallForSetu(api.chain))
  return sumTokens2({ tokensAndOwners, api, resolveLP: true, })
}

module.exports = {
  timetravel: false,
  methodology: "We count tvl from the cohort contracts.",
};

chains.forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})
const { sumTokens2 } = require('../helper/unwrapLPs')
const {
  getV1Calls,
  getV2Calls,
  createCallForSetu,
  chains,
} = require("./helper");

async function tvl(chain, block) {
  let balances = {};
  const tokensAndOwners = []
  tokensAndOwners.push(...await getV1Calls(chain))
  tokensAndOwners.push(...await getV2Calls(chain))
  tokensAndOwners.push(...await createCallForSetu(chain))
  return sumTokens2({ balances, tokensAndOwners, chain, block, resolveLP: true, })
}

module.exports = {
  timetravel: false,
  methodology: "We count tvl from the cohort contracts.",
};

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => tvl(chain, block)
  }
})
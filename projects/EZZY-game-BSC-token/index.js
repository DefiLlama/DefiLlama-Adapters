const { staking } = require("../helper/staking")

const contract = "0xc056124727540Fc26C3AF44d2b6BA4FbF59C6909"
const token = "0xb452bc9cead0b08c4ef99da0feb8e10ef6bb86bb"

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1674950,
  bsc: {
    staking: staking(contract, token, "bsc"),
    tvl: (async) => ({}),
  },
};
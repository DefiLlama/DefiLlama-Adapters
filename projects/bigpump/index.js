const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens } = require("../helper/chain/ton");
const { getConfig } = require("../helper/cache");

async function fetchTvl(api) {
  const res = await getConfig('bigpump', 'https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=bigpump')
  await sumTokens({ api, tokens: [ADDRESSES.ton.TON], owners: res, onlyWhitelistedTokens: true })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  ton: {
    tvl: fetchTvl
  }
}
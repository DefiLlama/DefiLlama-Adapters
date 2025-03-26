const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens } = require("../helper/chain/ton");
const { getConfig } = require("../helper/cache");

async function fetchTvl(api,) {
  const res = await getConfig('tonpump', 'https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=hot')
  await sumTokens({ api, tokens: [ADDRESSES.ton.TON], owners: res,  onlyWhitelistedTokens: true, })
}

module.exports = {
  timetravel: false,
  ton: {
    tvl: fetchTvl
  }
}

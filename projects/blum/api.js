const ADDRESSES = require("../helper/coreAssets.json")

const { sumTokens } = require("../helper/chain/ton")
const { getConfig } = require("../helper/cache")

// tonfunstats is dead (DNS fails) -> getConfig falls back to the cached list of ~370k bonding-curve contracts
// only TON balances are needed, so skip the per-chunk sleep and rely on the sdk's toncenter pacing
async function fetchTvl(api) {
  const res = await getConfig('blum', 'https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=blum')
  await sumTokens({ api, tokens: [ADDRESSES.ton.TON], owners: res, onlyWhitelistedTokens: true, })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  ton: {
    tvl: fetchTvl
  }
}

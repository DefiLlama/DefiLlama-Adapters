const { get } = require('../helper/http')

async function tvl(ts) {
  var end = ts.timestamp
  let start = end - 24 * 60 * 60;
  const { data } = await get(`https://icrc-api.internetcomputer.org/api/v1/ledgers/mxzaz-hqaaa-aaaar-qaada-cai/total-supply?start=${start}&end=${end}&step=1`);
  let [_, bal] = data.pop()
  return {
    'coingecko:bitcoin': bal / 1e8
  };
}

module.exports = {
  methodology: `We count the BTC as the collateral for the ckBTC`,
  bitcoin: { tvl: tvl },
}

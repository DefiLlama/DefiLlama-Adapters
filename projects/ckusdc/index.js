const { get } = require('../helper/http')

async function tvl(ts) {
  var end = ts.timestamp
  let start = end - 24 * 60 * 60;
  const { data } = await get(`https://icrc-api.internetcomputer.org/api/v1/ledgers/xevnm-gaaaa-aaaar-qafnq-cai/total-supply?start=${start}&end=${end}&step=1`);
  let [_, bal] = data.pop()
  return {
    'coingecko:usdc': bal / 1e8
  };
}

module.exports = {
  methodology: `We count the USDC as the collateral for the ckUSDC`,
  bitcoin: { tvl: tvl },
}

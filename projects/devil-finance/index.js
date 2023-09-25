const { get } = require('../helper/http')

function tvl(type) {
  return async () => {
    var response = await get("https://devilfinance.io/api/tvls")

    return { tether: response[type] };
  };
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  fantom: {
    tvl: tvl("nonNative"),
    pool2: tvl("nativeLP"),
    staking: tvl("native"),
  },
};

module.exports.fantom = { tvl: () => 0}
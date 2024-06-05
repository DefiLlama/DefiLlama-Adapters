const { get } = require("../helper/http");

module.exports = {
  misrepresentedTokens: true,
  methodology: "Sums the total supplies of Superstate's issued tokens.",
};

async function USTBPrice(ts) {
  const data = await get("https://api.superstate.co/v1/funds/1/nav-daily")
  let date = getDate(ts)
  const oneDay = 24 * 60 * 60
  let res = data.find((nav) => nav.net_asset_value_date === date)
  if (!res) {
    date = getDate(ts - oneDay)
    res = data.find((nav) => nav.net_asset_value_date === date)
  }
  return res.net_asset_value
}

const config = {
  ethereum: {
    USTB: '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e',
  },
}

Object.keys(config).forEach((chain) => {
  let fundsMap = config[chain];
  const fundAddresses = Object.values(fundsMap);

  module.exports[chain] = {
    tvl: async (api) => {
      let supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: fundAddresses });
      const price = await USTBPrice(api.timestamp);
      api.addCGToken('tether', supplies[0] * price / 1e6)
    }
  };
});

function getDate(ts) {
  const date = new Date(ts * 1000);
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}
const { getTokenSupplies, } = require("../helper/solana");

async function tvl(api) {
  const usdvAddress = "Ex5DaKYMCN6QWFA4n67TmMwsH8MJV68RX6YXTmVM532C";

  const res = await getTokenSupplies([usdvAddress]);
  api.add(usdvAddress, res[usdvAddress]);
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

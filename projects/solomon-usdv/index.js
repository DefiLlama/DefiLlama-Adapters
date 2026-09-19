const { getTokenSupplies, } = require("../helper/solana");

// Issuer Token-2022 mint. Not old vault Ex5DaKY…532C.
const usdvAddress = "USDvUSpnhCr9yBgj3UyVrD239HRUv4RsHwH2FxsWuMk";

async function tvl(api) {
  const res = await getTokenSupplies([usdvAddress]);
  api.add(usdvAddress, res[usdvAddress]);
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

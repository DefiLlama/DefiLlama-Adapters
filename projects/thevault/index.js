const { getTokenSupply } = require("../helper/solana")

async function tvl(api) {
  const bSOL = 'vSoLxydx6akxyMD9XEcPvGYNGq6Nn66oqVb3UkGkei7'
  const supply = await getTokenSupply(bSOL)
  api.add(bSOL, supply * 1e9)
}

module.exports = {
  timetravel: false,
  methodology: "vSOL total supply as it's equal to the SOL staked",
  solana: {
    tvl
  },
};

const { getTokenSupply } = require("../helper/solana")

async function tvl(api) {
  const bSOL = 'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1'
  const supply = await getTokenSupply(bSOL)
  api.add(bSOL, supply * 1e9)
}

module.exports = {
  timetravel: false,
  methodology: "bSOL total supply as it's equal to the SOL staked",
  solana: {
    tvl
  },
};

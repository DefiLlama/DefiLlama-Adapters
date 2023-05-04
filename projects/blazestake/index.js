const { getTokenSupply } = require("./helper/solana")

async function tvl() {
  const supply = await getTokenSupply("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1");

  return {
    'blazestake-staked-sol': supply
  }
}

module.exports = {
  timetravel: true,
  methodology: "bSOL total supply as it's equal to the SOL staked",
  solana: {
    tvl
  },
  hallmarks: [
    [1667865600, "FTX collapse"]
  ],
};

const sui = require("../helper/chain/sui");
const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULTS = [
  "0xb950819c5eba1bb5980f714f2a3b1d8738e3da58a4d9daf5fa21b6c2a7dd1e12", // mUSD
  "0x2d6e81126336685a28ea0637109b570510f988bba2b589877c9b579d3cb8cad8", // mETH
  "0x3062285974a5e517c88cf3395923aac788dce74f3640029a01e25d76c4e76f5d", // superSUI
  "0x0ff688058077c00a6b6df737e605dbb1fccfb5760246c5d3aaaacc750cb42384", // mBTC
]

async function tvl(api) {
  const vaultData = await sui.getObjects(VAULTS)
  for (const { fields: { metadata } } of vaultData) {
    const coins = await sui.getDynamicFieldObjects({ parent: metadata.fields.id.id })
    for (const coin of coins)
      api.add("0x" + coin.name, coin.fields.balance)
  }
  return sumTokens2({ api })
}

module.exports = {
  timetravel: true,
  sui: {
    tvl,
  },
};

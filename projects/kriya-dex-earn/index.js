const sui = require("../helper/chain/sui");
const { fetchURL } = require("../helper/utils");
const sui = require("../helper/chain/sui");

const vaultUrl =
  "https://88ob93rfva.execute-api.ap-southeast-1.amazonaws.com/release/vaults";

async function vaultTVL() {
  const vaults = (await fetchURL(vaultUrl))?.data;
  for (const vault of vaults) {
    const tokenX = Number(vault?.coinA) / 10 ** vault?.pool?.tokenXDecimals;
    const tokenY = Number(vault?.coinB) / 10 ** vault?.pool?.tokenYDecimals;

    api.add(vault?.pool?.tokenXType, tokenX);
    api.add(vault?.pool?.tokenYType, tokenY);
  }
  return {
    tvl,
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Collets all the TVL from the KriyaDEX vaults. The TVL is denominated in USD.",
  sui: {
    tvl: vaultTVL,
  },
};

const sui = require("../helper/chain/sui");
const { fetchURL } = require("../helper/utils");

const vaultUrl =
  "https://88ob93rfva.execute-api.ap-southeast-1.amazonaws.com/release/vaults";

async function vaultTVL() {
  let tvl = 0;
  const vaults = (await fetchURL(vaultUrl))?.data;
  for (const vault of vaults) {
    tvl += Number(vault?.tvl);
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

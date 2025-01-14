const { fetchURL } = require("../helper/utils");
const sui = require("../helper/chain/sui");

const clmmVaultUrl =
  "https://vjkibmct3h.execute-api.ap-southeast-1.amazonaws.com/release/vaults";

const llVaultUrl =
  "https://c19eainr59.execute-api.ap-southeast-1.amazonaws.com/release/defilama/vaults";

async function clmmVaultTVL(api) {
  const vaults = (await fetchURL(clmmVaultUrl))?.data;
  for (const vault of vaults) {
    const tokenX = Number(vault?.coinA);
    const tokenY = Number(vault?.coinB);

    api.add(vault?.pool?.tokenXType, tokenX);
    api.add(vault?.pool?.tokenYType, tokenY);
  }
}

async function llVaultTVL(api) {
  const vaults = (await fetchURL(llVaultUrl))?.data;
  for (const vault of vaults) {
    const aumBaseTokenReserve = Number(vault?.aumInBaseToken);

    api.add(vault?.pool?.tokenXType, aumBaseTokenReserve);
  }
}

async function vaultsTVL(api) {
  await llVaultTVL(api);
  await clmmVaultTVL(api);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Collets all the TVL from the KriyaDEX vaults. The TVL is denominated in USD.",
  sui: {
    tvl: vaultsTVL,
  },
};

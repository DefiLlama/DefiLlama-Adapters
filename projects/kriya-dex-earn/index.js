const { fetchURL } = require("../helper/utils");

const vaultsUrl =
  "https://api.kriya.finance/defillama/vaults";

const kdxStakingUrl =
  "https://api.kriya.finance/kdx/metrics";

const KDX_TYPE = "0x3b68324b392cee9cd28eba82df39860b6b220dc89bdd9b21f675d23d6b7416f1::kdx::KDX";
const KDX_DECIMALS = 6;

async function vaultTVL(api) {
  try {
    const vaults = (await fetchURL(vaultsUrl))?.data?.data;
    for (const vault of vaults) {
      if (vault?.vaultType === "KriyaClmm" ) continue;
      if (vault?.vaultType === "CetusClmm") {
        const tokenX = Number(vault?.info?.tokenXAmount) * 10 ** Number(vault?.info?.pool?.tokenXDecimals);
        const tokenY = Number(vault?.info?.tokenYAmount) * 10 ** Number(vault?.info?.pool?.tokenYDecimals);
        api.add(vault?.info?.pool?.tokenXType, tokenX);
        api.add(vault?.info?.pool?.tokenYType, tokenY);
      } else {
        const aumBaseTokenReserve = Number(vault?.info?.aumInBaseToken) * 10 ** Number(vault?.info?.tokenXDecimals);
        api.add(vault?.info?.tokenXType, aumBaseTokenReserve);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function staking(api) {
  const kdxMetrics = (await fetchURL(kdxStakingUrl))?.data?.data;
  const totalStaked = Number(kdxMetrics?.kdxStaked) * 10 ** KDX_DECIMALS;

  api.add(KDX_TYPE, totalStaked);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Collets all the TVL from the KriyaDEX vaults. The TVL is denominated in USD.",
  sui: {
    tvl: vaultTVL,
    staking,
  },
};

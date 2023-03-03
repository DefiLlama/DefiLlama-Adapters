const { staking } = require("../helper/staking");
const masterchefAddress = "0x35CC71888DBb9FfB777337324a4A60fdBAA19DDE";
const brlTokenAddress = "0x12c87331f086c3C926248f964f8702C0842Fd77F";
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  aurora: {
    tvl: getUniTVL({
      factory: '0xC5E1DaeC2ad401eBEBdd3E32516d90Ab251A3aA3',
      fetchBalances: true,
      useDefaultCoreAssets: true,
    }),
    staking: staking(masterchefAddress, brlTokenAddress, "aurora"),
  }
}


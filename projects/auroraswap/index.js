const { staking } = require("../helper/staking");
const { uniTvlExport } = require("../helper/calculateUniTvl");
const masterchefAddress = "0x35CC71888DBb9FfB777337324a4A60fdBAA19DDE";
const brlTokenAddress = "0x12c87331f086c3C926248f964f8702C0842Fd77F";

module.exports = {
  aurora: {
    tvl: uniTvlExport('0xC5E1DaeC2ad401eBEBdd3E32516d90Ab251A3aA3', 'aurora', true),
    staking: staking(masterchefAddress, brlTokenAddress),
  },
};

const { staking } = require("../helper/staking");
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const masterchefAddress = "0x35CC71888DBb9FfB777337324a4A60fdBAA19DDE";
const brlTokenAddress = "0x12c87331f086c3C926248f964f8702C0842Fd77F";

const tvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = await calculateUniTvl(
    (addr) => `aurora:${addr}`,
    chainBlocks.aurora,
    "aurora",
    "0xC5E1DaeC2ad401eBEBdd3E32516d90Ab251A3aA3",
    0,
    true
  );
  return balances;
};

module.exports = {
  aurora: {
    tvl,
    staking: staking(masterchefAddress, brlTokenAddress, "aurora"),
  },
};

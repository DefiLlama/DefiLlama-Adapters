const { uniTvlExport } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

const kronosFactory = "0xcc045ebC2664Daf316aa0652E72237609EA6CB4f";
const kRONOSMasterChef = "0x30e9f20414515116598D073F3EBA116c68A6f4aC";
const kronosDaoToken = "0xbeC68a941feCC79E57762e258fd1490F29235D75";
const kronosBusdLP = "0xDBB34E29D345788273e85DE84814CfAA95c9c5f7";

module.exports = {
  methodology: "TVL consists of pools created by the factory contract",
  bsc: {
    tvl: uniTvlExport(kronosFactory, 'bsc'),
    staking: stakingUnknownPricedLP(
      kRONOSMasterChef,
      kronosDaoToken,
      "bsc",
      kronosBusdLP,
      (addr) => `bsc:${addr}`
    ),
  },
};

const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require("../helper/staking");
const MasterChefContract = "0xD5f406eB9E38E3B3E35072A8A35E0DcC671ea8DB";
const FactoryContract = "0x36800286f652dDC9bDcFfEDc4e71FDd207C1d07C";
const SHARKY = "0x73eD68B834e44096eB4beA6eDeAD038c945722F1";

module.exports = {
  methodology:
    "Uses factory(0x36800286f652dDC9bDcFfEDc4e71FDd207C1d07C) address and whitelisted tokens address to find and price Liquidity Pool pairs",
  arbitrum: {
    tvl: getUniTVL({
      factory: FactoryContract,
      chain: "arbitrum"
    }),
    staking: staking(MasterChefContract, SHARKY, "arbitrum"),
  },
};

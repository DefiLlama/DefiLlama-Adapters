const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const ADAOStakingContract = "0x3BFcAE71e7d5ebC1e18313CeCEbCaD8239aA386c";

module.exports = {
  methodology:
    "A-DAO will be based on dApp staking of Astar Network. Users will get some of the developer rewards while participating and gaining basic rewards. At present, A-DAO divides the developer rewards into: Revenue Reward, On-chain Treasury, Incubation Fund, any rewards of which can be adjusted by DAO governance.",
  astar: {
    tvl: sumTokensExport({ owners: [ADAOStakingContract], tokens: [nullAddress] }),
  },
  // deadFrom: '2023-04-13',
};

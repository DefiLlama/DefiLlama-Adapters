const { staking } = require("../helper/staking");

const contracts = {
  SAKAI: "0x43b35e89d15b91162dea1c51133c4c93bdd1c4af",
  "Sakai-SP": "0xc20A079c7962D9fc92173cda349e80D484dFA42A", //Sakai Staking Protocol Contract
  "Sakai-SP-V2": "0xba94E7c2306aC3BE22C123041Fd7823d7fA15933", //Sakai Staking Protocol Contract V2,
};

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking(
      [contracts["Sakai-SP"], contracts["Sakai-SP-V2"]],
      contracts.SAKAI
    ),
  },
};

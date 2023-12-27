const { staking } = require("../helper/staking");

const contracts = {
  SAKAI: "0x43b35e89d15b91162dea1c51133c4c93bdd1c4af",
  "Sakai-SP": "0xc20A079c7962D9fc92173cda349e80D484dFA42A", //Sakai Staking Protocol Contract
  SakaiDAO: "0x8F2e2baD6020d8bB5BF947199CaE8eb86D24cfD7", //Sakai-DAO Contract
};

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking([contracts["Sakai-SP"], contracts["SakaiDAO"]], contracts.SAKAI),
  },
}
const { staking } = require('../helper/staking');

const contracts = {
  "SAKAI": "0x43b35e89d15b91162dea1c51133c4c93bdd1c4af",
  "Sakai-SP": "0xc20A079c7962D9fc92173cda349e80D484dFA42A" //Sakai Staking Protocol Contract
}

module.exports = {
  bsc: {
    tvl: () => 0,
    staking: staking(contracts['Sakai-SP'], contracts.SAKAI)
  },
}
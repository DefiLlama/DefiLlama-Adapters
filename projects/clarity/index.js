const { sumTokens2 } = require("../helper/chain/cardano");
const { clarityDaoTreasuryAddresses } = require("./dao-treasury-addresses");

async function tvl() {
  return await sumTokens2({
    owners: clarityDaoTreasuryAddresses,
  });
}

module.exports = {
  cardano: {
    tvl,
  },
};

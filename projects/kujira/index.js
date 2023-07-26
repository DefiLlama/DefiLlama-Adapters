const { sumTokens } = require('../helper/chain/cosmos')
const { getConfig } = require("../helper/cache");

const chain = "kujira";

async function tvl() {
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const uskContracts = contracts["kaiyo-1"].uskMarket.map(x => x.address)
  return sumTokens({ owners: uskContracts, chain })
}

module.exports = {
  kujira: {
    tvl,
  },
}
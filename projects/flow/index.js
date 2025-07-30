const { sumTokens2 } = require("../helper/chain/cardano");
const { get } = require("../helper/http")
const poolAddressesURL = "https://beta.flowcardano.org/api/getPoolAddresses"

async function tvl() {
  let poolAddresses = await get(poolAddressesURL);
  let addresses = Object.values(poolAddresses.poolAddresses).flatMap(entry => [
    entry.poolAddress,
    entry.vaultUTxOsAddress,
  ]);
  let assetsLocked = await sumTokens2({
    owners: addresses,
  });
  return assetsLocked;
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};

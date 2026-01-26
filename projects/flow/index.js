const { trySumTokens } = require("../helper/chain/cardano");
const { get } = require("../helper/http");
const poolAddressesURL = "https://surflending.org/api/getPoolAddresses";

async function tvl() {
  let poolAddresses = await get(poolAddressesURL);
  let addresses = Object.values(poolAddresses.poolAddresses).flatMap(
    (entry) => [entry.poolAddress, entry.vaultUTxOsAddress]
  );
  let assetsLocked = await trySumTokens({
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

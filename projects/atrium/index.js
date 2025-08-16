const { trySumTokens } = require("../helper/chain/cardano");
const { assetsAddresses } = require("../helper/chain/cardano/blockfrost");
const poolAssetAssetID = "f91c399aa9d544edc8059d4856acdbd8331f462cdcbd56733d6a85185374616b65506f6f6c"

async function tvl() {
    let poolScriptAddresses = (await assetsAddresses(poolAssetAssetID)).map(item => item.address);
  let assetsLocked = await trySumTokens({
    owners: poolScriptAddresses,
  });
  return assetsLocked;
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};

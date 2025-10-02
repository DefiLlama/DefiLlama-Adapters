const {getAllVaultIds, getAllPoolIds, mappingTokenAsset} = require("./utils")
const { getObject } = require("../helper/chain/sui");

async function tvl(api) {
  const vaultIds = await getAllVaultIds()
    // CDP 
    const cdpCollateralTypes = Object.keys(vaultIds)
    for(const collateralType of cdpCollateralTypes){
        const id = vaultIds[collateralType]
        const vaultFields = (await getObject(id)).fields

        api.add(mappingTokenAsset(collateralType), +vaultFields.total_coll_amount)
    }

    // PSM
    const poolIds = await getAllPoolIds()
    const psmCoinTypes = Object.keys(poolIds)
    for(const collateralType of psmCoinTypes){
       const poolId = poolIds[collateralType]
        const poolFields = (await getObject(poolId)).fields

        api.add(mappingTokenAsset(collateralType), +poolFields.balance_amount)
    }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};

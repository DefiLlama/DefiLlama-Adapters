import { autoCompoundVaultObjectId, btcUSDCVaultObjectId } from "./const";

const { getObject } = require("../helper/chain/sui");

export const tvl = async (api) => {
  
  const [autoCompoundVaultObject, btcUSDCVaultObject] = await Promise.all([
    getObject(autoCompoundVaultObjectId), 
    getObject(btcUSDCVaultObjectId),
  ])

  const lakeUSDCTvl = Number(autoCompoundVaultObject.fields.yield_usdb_balance) / TOKEN.lakeUSDC.decimals;
  const btcUSDCTvl = Number(btcUSDCVaultObject.fields.stake) / TOKEN.btcUSDC.decimals;

  api.add(TOKEN.lakeUSDC.type, lakeUSDCTvl);
  api.add(TOKEN.btcUSDC.type, btcUSDCTvl);
}
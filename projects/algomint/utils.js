const {
  getAppGlobalState,
  getAccountInfo,
} = require("../helper/chain/algorand");

async function lpTokenPostion(asaId, appId, basketAddress) {
  const poolGlobalState = await getAppGlobalState(appId);

  //A & B represent the two tokens in the LP pool, Token A is always the ASA with the lowest ID

  const balanceA = poolGlobalState.A;
  const balanceB = poolGlobalState.B;
  const lpCirculatingSupply = poolGlobalState.L;

  const ratioA = balanceA / lpCirculatingSupply;
  const ratioB = balanceB / lpCirculatingSupply;

  //get basket balance of lp token
  const basketBalance = await getAccountInfo(basketAddress);

  const basketLpBalanceObject = basketBalance.assets;
  let basketLpBalance;

  for (let lpAsset of basketLpBalanceObject) {
    if (lpAsset["asset-id"] === asaId) {
      basketLpBalance = lpAsset.amount;
    }
  }
  const positionA = basketLpBalance * ratioA;
  const positionB = basketLpBalance * ratioB;

  return { positionA: positionA, positionB: positionB };
}

module.exports = {
  lpTokenPostion,
};
